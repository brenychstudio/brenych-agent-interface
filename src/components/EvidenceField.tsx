import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

import type { AgentInterface, ProjectDossier } from "../application/AgentInterface";
import type { SemanticAction } from "../application/StatePort";
import type { ProjectId } from "../domain/types";
import type { CapabilityTrace, ProjectNodeState } from "../state/selectors";

import { AnimatedDisclosure } from "./AnimatedDisclosure";
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
  const [dragging, setDragging] = useState(false);
  const [hoveredProjectId, setHoveredProjectId] = useState<ProjectId | null>(null);
  const drag = useRef<DragState | null>(null);
  const fieldRef = useRef<HTMLElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const diagnosticFrame = useRef<number | null>(null);
  const renders = useRef(0);
  renders.current += 1;
  const reduceMotion = useReducedMotion();

  // High-frequency camera input lives entirely outside React: pointer pixels never schedule a render.
  const panX = useMotionValue(0);
  const panY = useMotionValue(0);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const cameraXTarget = useMotionValue(0);
  const cameraYTarget = useMotionValue(0);
  const cameraX = useSpring(cameraXTarget, { stiffness: 160, damping: 24, mass: .75 });
  const cameraY = useSpring(cameraYTarget, { stiffness: 160, damping: 24, mass: .75 });

  const writeDiagnostics = useCallback((): void => {
    const field = fieldRef.current;
    const camera = cameraRef.current;
    if (field) {
      field.dataset.panX = String(panX.get());
      field.dataset.panY = String(panY.get());
      field.dataset.parallaxX = String(pointerX.get());
      field.dataset.parallaxY = String(pointerY.get());
    }
    if (camera) {
      camera.dataset.cameraX = String(cameraXTarget.get());
      camera.dataset.cameraY = String(cameraYTarget.get());
    }
  }, [cameraXTarget, cameraYTarget, panX, panY, pointerX, pointerY]);

  // One coalesced DOM write per frame at most, whatever the pointer event rate.
  const commit = useCallback((): void => {
    cameraXTarget.set(reduceMotion ? 0 : panX.get() + pointerX.get());
    cameraYTarget.set(reduceMotion ? 0 : panY.get() + pointerY.get());
    if (diagnosticFrame.current !== null) return;
    diagnosticFrame.current = requestAnimationFrame(() => {
      diagnosticFrame.current = null;
      writeDiagnostics();
    });
  }, [cameraXTarget, cameraYTarget, panX, panY, pointerX, pointerY, reduceMotion, writeDiagnostics]);

  useLayoutEffect(() => {
    writeDiagnostics();
    return () => {
      if (diagnosticFrame.current !== null) cancelAnimationFrame(diagnosticFrame.current);
      diagnosticFrame.current = null;
    };
  }, [writeDiagnostics]);

  useEffect(() => {
    if (!reduceMotion) return;
    panX.set(0);
    panY.set(0);
    pointerX.set(0);
    pointerY.set(0);
    cameraXTarget.set(0);
    cameraYTarget.set(0);
    writeDiagnostics();
  }, [cameraXTarget, cameraYTarget, panX, panY, pointerX, pointerY, reduceMotion, writeDiagnostics]);

  const pointerMotionAllowed = (event: ReactPointerEvent<HTMLElement>): boolean =>
    event.pointerType !== "touch" && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const startDrag = (event: ReactPointerEvent<HTMLElement>): void => {
    const target = event.target;
    if (!pointerMotionAllowed(event) || (target instanceof Element && target.closest("button, a, [role=\"region\"]"))) return;
    drag.current = {
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      startX: panX.get(),
      startY: panY.get(),
    };
    pointerX.set(0);
    pointerY.set(0);
    setDragging(true);
    commit();
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const moveDrag = (event: ReactPointerEvent<HTMLElement>): void => {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    panX.set(clamp(active.startX + event.clientX - active.originX, -76, 76));
    panY.set(clamp(active.startY + event.clientY - active.originY, -42, 42));
    commit();
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
    pointerX.set(Math.round(x * 18));
    pointerY.set(Math.round(y * 12));
    commit();
  };

  const stopDrag = (event: ReactPointerEvent<HTMLElement>): void => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    drag.current = null;
    setDragging(false);
  };

  const releaseParallax = (): void => {
    if (drag.current) return;
    pointerX.set(0);
    pointerY.set(0);
    commit();
  };

  const visibleNodes = nodes.filter((node) =>
    node.visualForm !== "latent" || node.projectId === inspectedProjectId,
  );
  const visibleProjectIds = new Set(visibleNodes.map(({ projectId }) => projectId));
  const visibleConnections = connections.filter(({ projectId }) => visibleProjectIds.has(projectId));
  const visibleDossiers = dossiers.filter(({ id }) => visibleProjectIds.has(id));
  const activeNode = hoveredProjectId
    ? visibleNodes.find(({ projectId }) => projectId === hoveredProjectId)
    : undefined;
  const neighbors = activeNode
    ? visibleNodes
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
      ref={fieldRef}
      className={`evidence-field${receded ? " is-receded" : ""}${dragging ? " is-dragging" : ""}`}
      data-testid="evidence-field"
      data-render-count={renders.current}
      aria-label="Evidence field"
      onPointerDown={startDrag}
      onPointerMove={movePointer}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
      onPointerLeave={releaseParallax}
    >
      <div className="field-heading">
        <p className="field-label">CORE EVIDENCE GRAPH</p>
        <p className="field-count">4 EVIDENCE OBJECTS · 2 EXTENDED SIGNALS · 1 LATENT RECORD</p>
        <p className="field-state">{evaluated ? "EVALUATED EVIDENCE FIELD" : "UNEVALUATED EVIDENCE FIELD"}</p>
        <p className="field-action" aria-label="Shared surface control provenance">
          <strong>{action ? `${action.source === "webmcp" ? "WEBMCP" : "MANUAL"} ACTION` : "SHARED HUMAN + AGENT SURFACE"}</strong>
          <span>{action?.message ?? "RANK · FOCUS · DRAFT · INSPECT"}</span>
        </p>
        <p className="field-media-boundary">VISUALS: USER-APPROVED SCREENSHOTS · CLAIMS: VERIFIED EVIDENCE RECORDS</p>
      </div>
      <motion.div ref={cameraRef} className="field-camera" data-testid="field-camera" style={{ x: cameraX, y: cameraY }}>
        <div className="field-grid" aria-hidden="true" />
        <CapabilityConnections traces={visibleConnections} nodes={visibleNodes} dossiers={visibleDossiers} />
        {visibleNodes.map((node) => {
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
      <div className="evidence-index" onPointerDown={(event) => event.stopPropagation()}>
        <AnimatedDisclosure
          label="FULL EVIDENCE INDEX"
          meta={<p className="evidence-index-count">7 VERIFIED PROJECT RECORDS</p>}
        >
          <div className="evidence-index-list">
            {dossiers.map((dossier) => (
              <button
                key={dossier.id}
                type="button"
                data-project-id={dossier.id}
                aria-label={`Open ${dossier.title} evidence record`}
                onClick={(event) => {
                  onProjectFocus?.(event.currentTarget);
                  agent.focusProject({ projectId: dossier.id }, "manual");
                }}
              >
                <span>{dossier.title}</span>
                <span>OPEN ↗</span>
              </button>
            ))}
          </div>
        </AnimatedDisclosure>
      </div>
    </section>
  );
};
