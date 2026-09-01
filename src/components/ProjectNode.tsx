import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";

import type { AgentInterface, ProjectDossier } from "../application/AgentInterface";
import type { ProjectId } from "../domain/types";
import type { ProjectNodeState } from "../state/selectors";
import { projectVisibilityLabel } from "../presentation/displayLabels";
import { mediaForOwner } from "../presentation/evidenceMedia";

type ProjectProximity = "active" | "neighbor" | "ambient";

export const ProjectNode = ({
  dossier,
  node,
  agent,
  onProjectFocus,
  inspectedProjectId,
  proximity = "ambient",
  onProximityChange,
}: {
  readonly dossier: ProjectDossier;
  readonly node: ProjectNodeState;
  readonly agent: AgentInterface;
  readonly onProjectFocus?: (node: HTMLButtonElement) => void;
  readonly inspectedProjectId?: string | null;
  readonly proximity?: ProjectProximity;
  readonly onProximityChange?: (projectId: ProjectId | null) => void;
}) => {
  const reduceMotion = useReducedMotion();
  const primaryMedia = mediaForOwner(dossier.id).find((item) => item.role === "primary");
  const evaluated = node.rank !== null;
  const depth = node.spatialTier === "dominant" ? "foreground" : node.spatialTier === "near" ? "near" : "receded";
  const inspectionState = inspectedProjectId ? (inspectedProjectId === dossier.id ? "selected" : "receded") : null;
  const inspectionLabel = inspectionState === "selected" ? "SELECTED" : inspectionState ? "BACKGROUND" : null;
  const stateLabel = evaluated
    ? `RANK ${node.rank} · ${depth.toUpperCase()} · ${node.matchState.toUpperCase()}`
    : null;
  const style = {
    "--node-x": `${node.transform.x}%`,
    "--node-y": `${node.transform.y}%`,
    "--node-z-index": node.transform.zIndex,
    "--node-order": node.rank ?? 99,
  } as CSSProperties;
  const proximityScale = proximity === "active" ? 1.06 : proximity === "neighbor" ? .98 : 1;
  const proximityDepth = proximity === "active" ? 42 : proximity === "neighbor" ? 8 : 0;
  const animate = {
    "--node-z": `${node.transform.z + proximityDepth}px`,
    "--node-scale": node.transform.scale * proximityScale,
    "--node-opacity": proximity === "active" ? 1 : node.transform.opacity,
    y: reduceMotion || node.presentationTier === "extended" || proximity !== "ambient" ? 0 : [0, -3, 0],
  };
  const focus = (element: HTMLButtonElement): void => {
    onProjectFocus?.(element);
    agent.focusProject({ projectId: dossier.id }, "manual");
  };
  return (
    <motion.button
      type="button"
      className={`project-node${inspectionState ? ` is-inspect-${inspectionState}` : ""}`}
      data-project-id={dossier.id}
      data-spatial-tier={node.spatialTier}
      data-presentation-tier={node.presentationTier}
      data-visual-form={node.visualForm}
      data-proximity={proximity}
      data-media-kind={node.visualForm === "extended-signal" ? "signal" : primaryMedia ? "screenshot" : "typographic"}
      data-inspection-state={inspectionState ?? "idle"}
      data-entry-layout-id={`project-evidence-${dossier.id}`}
      style={style}
      layoutId={`project-evidence-${dossier.id}`}
      initial={false}
      animate={animate}
      transition={reduceMotion
        ? { duration: 0 }
        : { default: { duration: .34, ease: [0.22, 1, 0.36, 1] }, y: { duration: 5.4, repeat: Infinity, ease: "easeInOut" } }}
      aria-label={evaluated
        ? `Project ${dossier.title}, rank ${node.rank}, ${depth}, ${node.matchState}${inspectionLabel ? `, inspect ${inspectionLabel.toLowerCase()}` : ""}`
        : `Project ${dossier.title}, field, not evaluated${inspectionLabel ? `, inspect ${inspectionLabel.toLowerCase()}` : ""}`}
      onClick={(event) => focus(event.currentTarget)}
      onPointerEnter={() => onProximityChange?.(dossier.id)}
      onPointerLeave={() => onProximityChange?.(null)}
      onFocus={() => onProximityChange?.(dossier.id)}
      onBlur={() => onProximityChange?.(null)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          focus(event.currentTarget);
        }
      }}
    >
      {node.visualForm === "extended-signal" ? (
        <span className="node-signal">
          <span className="node-signal-label">EXTENDED EVIDENCE</span>
          <strong>{dossier.title}</strong>
          <span>{dossier.productType}</span>
          <span className="node-signal-action">INSPECT ↗</span>
        </span>
      ) : primaryMedia ? (
        <span className="node-media">
          <img src={primaryMedia.src} alt={primaryMedia.alt} width={primaryMedia.width} height={primaryMedia.height} loading={dossier.id === "bdb" ? "eager" : "lazy"} decoding="async" />
          <span className="node-media-caption">{primaryMedia.caption}</span>
        </span>
      ) : (
        <span className="node-typographic-evidence">
          <span className="node-sigil" aria-hidden="true">{dossier.title.slice(0, 2).toUpperCase()}</span>
          {dossier.id === "native-site-control" ? (
            <>
              <span>ARCHITECTURE FOUNDATION</span>
              <span>PUBLIC UI NOT YET AVAILABLE</span>
            </>
          ) : <span>TYPE-LED EVIDENCE</span>}
        </span>
      )}
      {node.visualForm === "evidence-object" ? (
        <span className="node-content">
          {stateLabel || inspectionLabel ? <span className="node-kicker">{stateLabel}{inspectionLabel ? `${stateLabel ? " · " : ""}INSPECT ${inspectionLabel}` : ""}</span> : null}
          <strong>{dossier.title}</strong>
          <span className="node-product-type">{dossier.productType}</span>
          <span className="node-maturity">{dossier.maturityLabel}</span>
          <span className="node-capabilities">{dossier.capabilities.slice(0, 4).map((capability) => capability.label).join(" · ")}</span>
          <span className="visibility">{projectVisibilityLabel(dossier.visibility)}</span>
        </span>
      ) : null}
    </motion.button>
  );
};
