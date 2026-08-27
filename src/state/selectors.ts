import { capabilities } from "../domain/capabilities";
import { evidenceRecords } from "../domain/evidence";
import { projects } from "../domain/projects";
import type { ProjectId } from "../domain/types";
import type { AppSemanticState } from "../application/StatePort";

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
    const ranked = rankByProject.get(project.id);
    const matchState = !state.matchResult
      ? "not_evaluated"
      : !ranked || ranked.project.score === 0
        ? "unmatched"
        : ranked.project.matchedRequirementIds.length > 0 ? "matched" : "partial";
    const leading = ranked !== undefined && ranked.project.score > 0 && ranked.rank <= 3;
    return {
      projectId: project.id,
      rank: state.matchResult ? ranked?.rank ?? null : null,
      matchState,
      transform: {
        x: (index % 3) * 35,
        y: Math.floor(index / 3) * 32,
        z: !state.matchResult ? -40 : leading ? 0 : ranked && ranked.project.score > 0 ? -40 : -80,
        scale: leading ? 1 : ranked && ranked.project.score > 0 ? 0.95 : 0.92,
        opacity: leading ? 1 : ranked && ranked.project.score > 0 ? 0.66 : state.matchResult ? 0.42 : 0.56,
        zIndex: leading ? 20 - ranked.rank : ranked && ranked.project.score > 0 ? 8 : 4,
      },
    };
  });
};

export const selectProjectEvidenceIds = (projectId: ProjectId): readonly string[] => evidenceRecords.filter((record) => record.projectId === projectId).map((record) => record.id);

export const selectCapability = (id: string) => capabilities.find((capability) => capability.id === id);
