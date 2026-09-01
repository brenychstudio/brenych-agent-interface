import { capabilities } from "../domain/capabilities";
import { evidenceRecords } from "../domain/evidence";
import { projects } from "../domain/projects";
import type { ProjectId } from "../domain/types";
import type { AppSemanticState } from "../application/StatePort";
import {
  projectPresentation,
  rankedPresentationSlots,
  type ProjectPresentationTier,
  type ProjectVisualForm,
} from "../presentation/projectPresentation";

export const selectMissingRequirementIds = (state: AppSemanticState): readonly string[] => state.matchResult?.missing ?? [];

export const selectHighlightedCapabilityIds = (state: AppSemanticState): readonly string[] => {
  if (!state.matchResult) return [];
  return [...new Set(state.matchResult.rankedProjects.flatMap((project) => project.evidence.map((evidence) => evidence.capabilityId)))];
};

export interface FocusedProjectContext {
  readonly projectId: ProjectId;
  readonly reason: string;
  readonly matchedRequirements: readonly string[];
  readonly partialRequirements: readonly string[];
}

export const selectFocusedProjectContext = (state: AppSemanticState): FocusedProjectContext | undefined => {
  if (!state.focusedProjectId) return undefined;
  const project = projects.find((candidate) => candidate.id === state.focusedProjectId);
  if (!project) return undefined;
  const ranked = state.matchResult?.rankedProjects.find((candidate) => candidate.projectId === project.id);
  if (!state.matchResult || !ranked) return { projectId: project.id, reason: `Selected ${project.displayName}; no active requirement evaluation.`, matchedRequirements: [], partialRequirements: [] };
  const matchedIds = ranked.matchedRequirementIds;
  const partialIds = ranked.partialRequirementIds;
  const matchedRequirements = state.matchResult.requirements
    .filter((requirement) => matchedIds.includes(requirement.id))
    .map((requirement) => requirement.original);
  const partialRequirements = state.matchResult.requirements
    .filter((requirement) => partialIds.includes(requirement.id))
    .map((requirement) => requirement.original);
  const reason = matchedIds.length > 0 && partialIds.length > 0
    ? `Selected ${project.displayName}; evidence directly supports ${matchedIds.join(", ")}; related evidence connects ${partialIds.join(", ")}.`
    : matchedIds.length > 0
      ? `Selected ${project.displayName}; evidence directly supports ${matchedIds.join(", ")}.`
      : partialIds.length > 0
        ? `Selected ${project.displayName}; evidence is related to ${partialIds.join(", ")}.`
        : `Selected ${project.displayName}; no evidence matched the active requirements.`;
  return {
    projectId: project.id,
    reason,
    matchedRequirements,
    partialRequirements,
  };
};

export interface ProjectNodeState {
  readonly projectId: ProjectId;
  readonly rank: number | null;
  readonly matchState: "not_evaluated" | "matched" | "partial" | "unmatched";
  readonly presentationTier: ProjectPresentationTier;
  readonly visualForm: ProjectVisualForm;
  readonly spatialTier: "field" | "dominant" | "near" | "secondary" | "receded";
  readonly transform: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly scale: number;
    readonly opacity: number;
    readonly zIndex: number;
  };
}

export const selectProjectNodeStates = (state: AppSemanticState): readonly ProjectNodeState[] => {
  const rankByProject = new Map(state.matchResult?.rankedProjects.map((project, index) => [project.projectId, { project, rank: index + 1 }]) ?? []);
  return projects.map((project, index) => {
    const presentation = projectPresentation[project.id];
    const ranked = rankByProject.get(project.id);
    const matchState = !state.matchResult
      ? "not_evaluated"
      : !ranked || ranked.project.score === 0
        ? "unmatched"
        : ranked.project.matchedRequirementIds.length > 0 ? "matched" : "partial";
    const hasEvidence = ranked !== undefined && ranked.project.score > 0;
    const spatialTier: ProjectNodeState["spatialTier"] = !state.matchResult
      ? "field"
      : !hasEvidence
        ? "receded"
        : ranked.rank === 1
          ? "dominant"
          : ranked.rank <= 3
            ? "near"
            : "secondary";
    const position = state.matchResult
      ? rankedPresentationSlots[(ranked?.rank ?? index + 1) - 1] ?? rankedPresentationSlots[index]
      : presentation.defaultSlot;
    const visualForm: ProjectVisualForm = presentation.tier === "flagship"
      || (hasEvidence && ranked !== undefined && ranked.rank <= 3)
      ? "evidence-object"
      : "extended-signal";
    const visual = !state.matchResult
      ? presentation.defaultVisual
      : spatialTier === "dominant"
        ? { z: 36, scale: 1.12, opacity: 1, zIndex: 40 }
        : spatialTier === "near"
          ? { z: 4, scale: 1, opacity: 0.94, zIndex: 28 - (ranked?.rank ?? 0) }
          : spatialTier === "secondary"
            ? { z: -44, scale: 0.84, opacity: 0.66, zIndex: 10 }
            : spatialTier === "receded"
              ? { z: -88, scale: 0.8, opacity: 0.42, zIndex: 5 }
              : presentation.defaultVisual;
    return {
      projectId: project.id,
      rank: state.matchResult ? ranked?.rank ?? null : null,
      matchState,
      presentationTier: presentation.tier,
      visualForm,
      spatialTier,
      transform: {
        x: position.x,
        y: position.y,
        ...visual,
      },
    };
  });
};

export interface CapabilityTrace {
  readonly requirementId: string;
  readonly requirement: string;
  readonly capabilityId: string;
  readonly capability: string;
  readonly projectId: ProjectId;
  readonly project: string;
}

export const selectCapabilityTraces = (state: AppSemanticState): readonly CapabilityTrace[] => {
  if (state.activeMode !== "match" || !state.matchResult) return [];

  return state.matchResult.requirements
    .filter((requirement) => requirement.label !== "missing")
    .flatMap((requirement) => {
      const candidates = state.matchResult?.rankedProjects.flatMap((ranked, rankIndex) =>
        ranked.evidence
          .filter((item) => item.requirementId === requirement.id)
          .map((item) => ({ item, rankIndex })),
      ) ?? [];
      const strongest = candidates.sort(
        (left, right) => right.item.strength - left.item.strength || left.rankIndex - right.rankIndex,
      )[0];
      if (!strongest) return [];
      const capability = capabilities.find((item) => item.id === strongest.item.capabilityId);
      const project = projects.find((item) => item.id === strongest.item.projectId);
      if (!capability || !project) return [];
      return [{
        requirementId: requirement.id,
        requirement: requirement.original,
        capabilityId: capability.id,
        capability: capability.label,
        projectId: project.id,
        project: project.displayName,
      }];
    })
    .slice(0, 5);
};

export const selectProjectEvidenceIds = (projectId: ProjectId): readonly string[] => evidenceRecords.filter((record) => record.projectId === projectId).map((record) => record.id);

export const selectCapability = (id: string) => capabilities.find((capability) => capability.id === id);
