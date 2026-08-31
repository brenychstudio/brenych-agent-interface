import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";

import type { AgentInterface, ProjectDossier } from "../application/AgentInterface";
import type { SemanticAction } from "../application/StatePort";
import type { CapabilityTrace, ProjectNodeState } from "../state/selectors";

import { CapabilityConnections } from "./CapabilityConnections";
import { ProjectNode } from "./ProjectNode";

interface DragState {
  readonly pointerId: number;
  readonly originX: number;
  readonly originY: number;
  readonly startX: number;
  readonly startY: number;
}

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

export const EvidenceField = ({
  agent,
  dossiers,
  nodes,
  receded = false,
  onProjectFocus,
  inspectedProjectId,
  connections = [],
  action = null,
}: {
  readonly agent: AgentInterface;
  readonly dossiers: readonly ProjectDossier[];
  readonly nodes: readonly ProjectNodeState[];
  readonly receded?: boolean;
  readonly onProjectFocus?: (node: HTMLButtonElement) => void;
  readonly inspectedProjectId?: string | null;
  readonly connections?: readonly CapabilityTrace[];
  readonly action?: SemanticAction | null;
}) => {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const drag = useRef<DragState | null>(null);

  const pointerMotionAllowed = (event: ReactPointerEvent<HTMLElement>): boolean =>
    event.pointerType !== "touch" && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const startDrag = (event: ReactPointerEvent<HTMLElement>): void => {
    const target = event.target;
    if (!pointerMotionAllowed(event) || (target instanceof Element && target.closest("button"))) return;
    drag.current = {
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      startX: pan.x,
      startY: pan.y,
    };
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const moveDrag = (event: ReactPointerEvent<HTMLElement>): void => {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    setPan({
      x: clamp(active.startX + event.clientX - active.originX, -18, 18),
      y: clamp(active.startY + event.clientY - active.originY, -12, 12),
    });
  };

  const stopDrag = (event: ReactPointerEvent<HTMLElement>): void => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    drag.current = null;
    setDragging(false);
  };

  const style = {
    "--field-pan-x": `${pan.x}px`,
    "--field-pan-y": `${pan.y}px`,
  } as CSSProperties;

  return (
    <section
      className={`evidence-field${receded ? " is-receded" : ""}${dragging ? " is-dragging" : ""}`}
      data-testid="evidence-field"
      data-pan-x={pan.x}
      data-pan-y={pan.y}
      aria-label="Evidence field"
      style={style}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
    >
      <div className="field-grid" aria-hidden="true" />
      <div className="field-heading">
        <p className="field-label">CORE EVIDENCE GRAPH</p>
        <p className="field-count">7 SCORED PROJECTS · DIRECT INSPECT</p>
        <p className="field-action" aria-label="Shared surface control provenance">
          <strong>{action ? `${action.source === "webmcp" ? "WEBMCP" : "MANUAL"} ACTION` : "SHARED HUMAN + AGENT SURFACE"}</strong>
          <span>{action?.message ?? "RANK · FOCUS · DRAFT · INSPECT"}</span>
        </p>
        <p className="field-media-boundary">VISUALS: USER-APPROVED SCREENSHOTS · CLAIMS: VERIFIED EVIDENCE RECORDS</p>
      </div>
      <CapabilityConnections traces={connections} nodes={nodes} dossiers={dossiers} />
      {nodes.map((node) => {
        const dossier = dossiers.find((candidate) => candidate.id === node.projectId);
        return dossier ? <ProjectNode key={node.projectId} dossier={dossier} node={node} agent={agent} onProjectFocus={onProjectFocus} inspectedProjectId={inspectedProjectId} /> : null;
      })}
    </section>
  );
};
