import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

import type { AgentInterface, ProjectDossier } from "../application/AgentInterface";
import type { SemanticAction } from "../application/StatePort";
import type { ProjectId } from "../domain/types";
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
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [hoveredProjectId, setHoveredProjectId] = useState<ProjectId | null>(null);
  const drag = useRef<DragState | null>(null);
  const reduceMotion = useReducedMotion();
  const cameraXTarget = useMotionValue(0);
  const cameraYTarget = useMotionValue(0);
  const cameraX = useSpring(cameraXTarget, { stiffness: 160, damping: 24, mass: .75 });
  const cameraY = useSpring(cameraYTarget, { stiffness: 160, damping: 24, mass: .75 });

  useEffect(() => {
    cameraXTarget.set(reduceMotion ? 0 : pan.x + parallax.x);
    cameraYTarget.set(reduceMotion ? 0 : pan.y + parallax.y);
  }, [cameraXTarget, cameraYTarget, pan, parallax, reduceMotion]);

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
    setParallax({ x: 0, y: 0 });
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const moveDrag = (event: ReactPointerEvent<HTMLElement>): void => {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    setPan({
      x: clamp(active.startX + event.clientX - active.originX, -76, 76),
      y: clamp(active.startY + event.clientY - active.originY, -42, 42),
    });
  };

  const movePointer = (event: ReactPointerEvent<HTMLElement>): void => {
    if (drag.current) {
      moveDrag(event);
      return;
    }
    if (!pointerMotionAllowed(event)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width || window.innerWidth || 1;
    const height = rect.height || window.innerHeight || 1;
    const left = rect.width ? rect.left : 0;
    const top = rect.height ? rect.top : 0;
    const x = clamp(((event.clientX - left) / width) * 2 - 1, -1, 1);
    const y = clamp(((event.clientY - top) / height) * 2 - 1, -1, 1);
    setParallax({ x: Math.round(x * 18), y: Math.round(y * 12) });
  };

  const stopDrag = (event: ReactPointerEvent<HTMLElement>): void => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    drag.current = null;
    setDragging(false);
  };

  const activeNode = hoveredProjectId
    ? nodes.find(({ projectId }) => projectId === hoveredProjectId)
    : undefined;
  const neighbors = activeNode
    ? nodes
      .filter(({ projectId }) => projectId !== activeNode.projectId)
      .map((node) => ({
        projectId: node.projectId,
        distance: Math.hypot(
          node.transform.x - activeNode.transform.x,
          node.transform.y - activeNode.transform.y,
        ),
      }))
      .sort((left, right) => left.distance - right.distance)
      .slice(0, 2)
      .map(({ projectId }) => projectId)
    : [];
  const evaluated = nodes.some(({ rank }) => rank !== null);

  return (
    <section
      className={`evidence-field${receded ? " is-receded" : ""}${dragging ? " is-dragging" : ""}`}
      data-testid="evidence-field"
      data-pan-x={pan.x}
      data-pan-y={pan.y}
      data-parallax-x={parallax.x}
      data-parallax-y={parallax.y}
      aria-label="Evidence field"
      onPointerDown={startDrag}
      onPointerMove={movePointer}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
      onPointerLeave={() => { if (!drag.current) setParallax({ x: 0, y: 0 }); }}
    >
      <div className="field-heading">
        <p className="field-label">CORE EVIDENCE GRAPH</p>
        <p className="field-count">4 FLAGSHIP OBJECTS · 3 EXTENDED SIGNALS</p>
        <p className="field-state">{evaluated ? "EVALUATED EVIDENCE FIELD" : "UNEVALUATED EVIDENCE FIELD"}</p>
        <p className="field-action" aria-label="Shared surface control provenance">
          <strong>{action ? `${action.source === "webmcp" ? "WEBMCP" : "MANUAL"} ACTION` : "SHARED HUMAN + AGENT SURFACE"}</strong>
          <span>{action?.message ?? "RANK · FOCUS · DRAFT · INSPECT"}</span>
        </p>
        <p className="field-media-boundary">VISUALS: USER-APPROVED SCREENSHOTS · CLAIMS: VERIFIED EVIDENCE RECORDS</p>
      </div>
      <motion.div className="field-camera" style={{ x: cameraX, y: cameraY }}>
        <div className="field-grid" aria-hidden="true" />
        <CapabilityConnections traces={connections} nodes={nodes} dossiers={dossiers} />
        {nodes.map((node) => {
          const dossier = dossiers.find((candidate) => candidate.id === node.projectId);
          const proximity = hoveredProjectId === node.projectId
            ? "active"
            : neighbors.includes(node.projectId) ? "neighbor" : "ambient";
          return dossier ? (
            <ProjectNode
              key={node.projectId}
              dossier={dossier}
              node={node}
              agent={agent}
              onProjectFocus={onProjectFocus}
              inspectedProjectId={inspectedProjectId}
              proximity={proximity}
              onProximityChange={setHoveredProjectId}
            />
          ) : null;
        })}
      </motion.div>
    </section>
  );
};
