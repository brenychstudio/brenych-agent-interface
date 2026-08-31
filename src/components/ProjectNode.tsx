import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";

import type { AgentInterface, ProjectDossier } from "../application/AgentInterface";
import type { ProjectNodeState } from "../state/selectors";
import { projectVisibilityLabel } from "../presentation/displayLabels";
import { mediaForOwner } from "../presentation/evidenceMedia";

export const ProjectNode = ({
  dossier,
  node,
  agent,
  onProjectFocus,
  inspectedProjectId,
}: {
  readonly dossier: ProjectDossier;
  readonly node: ProjectNodeState;
  readonly agent: AgentInterface;
  readonly onProjectFocus?: (node: HTMLButtonElement) => void;
  readonly inspectedProjectId?: string | null;
}) => {
  const reduceMotion = useReducedMotion();
  const primaryMedia = mediaForOwner(dossier.id).find((item) => item.role === "primary");
  const evaluated = node.rank !== null;
  const depth = node.spatialTier === "dominant" ? "foreground" : node.spatialTier === "near" ? "near" : "receded";
  const inspectionState = inspectedProjectId ? (inspectedProjectId === dossier.id ? "selected" : "receded") : null;
  const inspectionLabel = inspectionState === "selected" ? "SELECTED" : inspectionState ? "BACKGROUND" : null;
  const stateLabel = evaluated
    ? `RANK ${node.rank} \u00b7 ${depth.toUpperCase()} \u00b7 ${node.matchState.toUpperCase()}`
    : "FIELD \u00b7 NOT EVALUATED";
  const style = {
    "--node-x": `${node.transform.x}%`,
    "--node-y": `${node.transform.y}%`,
    "--node-z-index": node.transform.zIndex,
    "--node-order": node.rank ?? 99,
  } as CSSProperties;
  const animate = {
    "--node-z": `${node.transform.z}px`,
    "--node-scale": node.transform.scale,
    "--node-opacity": node.transform.opacity,
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
      data-media-kind={primaryMedia ? "screenshot" : "typographic"}
      style={style}
      initial={false}
      animate={animate}
      transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
      aria-label={evaluated
        ? `Project ${dossier.title}, rank ${node.rank}, ${depth}, ${node.matchState}${inspectionLabel ? `, inspect ${inspectionLabel.toLowerCase()}` : ""}`
        : `Project ${dossier.title}, field, not evaluated${inspectionLabel ? `, inspect ${inspectionLabel.toLowerCase()}` : ""}`}
      onClick={(event) => focus(event.currentTarget)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          focus(event.currentTarget);
        }
      }}
    >
      {primaryMedia ? (
        <span className="node-media">
          <img src={primaryMedia.src} alt={primaryMedia.alt} width={primaryMedia.width} height={primaryMedia.height} loading={dossier.id === "bdb" ? "eager" : "lazy"} decoding="async" />
          <span className="node-media-caption">{primaryMedia.caption}</span>
        </span>
      ) : (
        <span className="node-typographic-evidence">
          <span className="node-sigil" aria-hidden="true">{dossier.title.slice(0, 2).toUpperCase()}</span>
          <span>TYPE-LED EVIDENCE</span>
        </span>
      )}
      <span className="node-content">
        <span className="node-kicker">{stateLabel}{inspectionLabel ? ` \u00b7 INSPECT ${inspectionLabel}` : ""}</span>
        <strong>{dossier.title}</strong>
        <span className="node-product-type">{dossier.productType}</span>
        <span className="node-maturity">{dossier.maturityLabel}</span>
        <span className="node-capabilities">{dossier.capabilities.slice(0, 4).map((capability) => capability.label).join(" \u00b7 ")}</span>
        <span className="visibility">{projectVisibilityLabel(dossier.visibility)}</span>
      </span>
    </motion.button>
  );
};
