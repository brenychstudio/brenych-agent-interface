import { buildCollaborationBrief, type CollaborationBriefInput, validateCollaborationBriefInput } from "../domain/buildCollaborationBrief";
import { capabilities } from "../domain/capabilities";
import { evidenceRecords } from "../domain/evidence";
import { INPUT_LIMITS } from "../domain/limits";
import { buildMatchResult } from "../domain/matchRequirements";
import { normalizeRequirement } from "../domain/normalizeRequirement";
import { profile } from "../domain/profile";
import { projects } from "../domain/projects";
import type { Capability, CapabilityId, CollaborationBrief, Project, ProjectId, ProjectMaturity, PublicProfile } from "../domain/types";
import type { ActionProvenance, RegistrationState, StatePort } from "./StatePort";

export interface CapabilityDto {
  readonly id: CapabilityId;
  readonly label: string;
  readonly category: string;
  readonly source: string;
  readonly summary: string;
  readonly evidenceCount: number;
  readonly strongestEvidenceProjectIds: readonly ProjectId[];
}

export interface ProjectDossier {
  readonly id: ProjectId;
  readonly title: string;
  readonly publicEvidenceName?: string;
  readonly summary: string;
  readonly productType: string;
  readonly maturity: ProjectMaturity;
  readonly maturityLabel: string;
  readonly visibility: Project["visibility"];
  readonly verificationLevels: Project["verificationLevels"];
  readonly verifiedHighlights: readonly string[];
  readonly capabilities: readonly Pick<CapabilityDto, "id" | "label" | "category">[];
  readonly evidence: readonly Pick<(typeof evidenceRecords)[number], "id" | "claim" | "visibility" | "verificationLevel" | "sourceLabel" | "sourceReference">[];
  readonly links: Project["links"];
  readonly limitations: readonly string[];
}

export interface GetCapabilitiesInput { readonly query?: string; readonly category?: string; readonly limit?: number }
export interface ListProjectsInput { readonly query?: string; readonly capabilityIds?: readonly string[]; readonly maturity?: ProjectMaturity; readonly limit?: number }
export interface MatchRequirementsInput { readonly requirements: readonly string[] }
export interface FocusProjectInput { readonly projectId: ProjectId }

function assertObject(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${label} must be an object`);
}

const cloneImmutable = <Value>(value: Value): Value => {
  if (Array.isArray(value)) return Object.freeze(value.map((item) => cloneImmutable(item))) as Value;
  if (value !== null && typeof value === "object") {
    const clone = Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [key, cloneImmutable(nested)]),
    );
    return Object.freeze(clone) as Value;
  }
  return value;
};

const assertQuery = (query: unknown): string | undefined => {
  if (query === undefined) return undefined;
  if (typeof query !== "string") throw new TypeError("query must be a string");
  if (query.length > INPUT_LIMITS.queryLength) throw new RangeError("query must be at most 120 characters");
  return normalizeRequirement(query).normalized;
};

const assertLimit = (value: unknown, maximum: number, label: string): number => {
  if (value === undefined) return maximum;
  if (!Number.isInteger(value) || (value as number) < 1 || (value as number) > maximum) throw new RangeError(`${label} must be between 1 and ${maximum}`);
  return value as number;
};

const capabilityById = (id: string): Capability => {
  const capability = capabilities.find((candidate) => candidate.id === id);
  if (!capability) throw new RangeError(`unknown capability: ${id}`);
  return capability;
};

const projectById = (id: string): Project => {
  const project = projects.find((candidate) => candidate.id === id);
  if (!project) throw new RangeError(`unknown project: ${id}`);
  return project;
};

const toCapabilityDto = (capability: Capability): CapabilityDto => {
  const evidence = evidenceRecords.filter((record) => record.capabilityId === capability.id);
  return { id: capability.id, label: capability.label, category: capability.category, source: capability.source, summary: capability.summary, evidenceCount: evidence.length, strongestEvidenceProjectIds: [...new Set(evidence.map((record) => record.projectId))] };
};

const toDossier = (project: Project): ProjectDossier => ({
  id: project.id,
  title: project.displayName,
  publicEvidenceName: project.publicEvidenceName,
  summary: project.summary,
  productType: project.productType,
  maturity: project.maturity,
  maturityLabel: project.maturityLabel,
  visibility: project.visibility,
  verificationLevels: project.verificationLevels,
  verifiedHighlights: project.verifiedHighlights,
  capabilities: project.capabilityIds.map((id) => {
    const capability = capabilityById(id);
    return { id: capability.id, label: capability.label, category: capability.category };
  }),
  evidence: evidenceRecords.filter((record) => record.projectId === project.id).map(({ id, claim, visibility, verificationLevel, sourceLabel, sourceReference }) => ({ id, claim, visibility, verificationLevel, sourceLabel, sourceReference })),
  links: project.links,
  limitations: project.limitations,
});

export interface AgentInterface {
  getProfile(): PublicProfile;
  getCapabilities(input?: GetCapabilitiesInput): readonly CapabilityDto[];
  listProjects(input?: ListProjectsInput): readonly ProjectDossier[];
  getProject(projectId: ProjectId): ProjectDossier;
  matchRequirements(input: MatchRequirementsInput, provenance: ActionProvenance): ReturnType<typeof buildMatchResult>;
  focusProject(input: FocusProjectInput, provenance: ActionProvenance): ProjectDossier;
  createCollaborationBrief(input: CollaborationBriefInput, provenance: ActionProvenance): CollaborationBrief;
  updateCollaborationBrief(input: Partial<CollaborationBriefInput>, provenance: ActionProvenance): CollaborationBrief;
  clearMatch(provenance: ActionProvenance): void;
  close(provenance: ActionProvenance): void;
  reset(provenance: ActionProvenance): void;
  setRegistrationState(input: { readonly webMcpAvailable: boolean; readonly registrationState: RegistrationState }, provenance: ActionProvenance): void;
}

export const createAgentInterface = (state: StatePort): AgentInterface => ({
  getProfile: () => cloneImmutable(profile),
  getCapabilities: (input = {}) => {
    assertObject(input, "capability query");
    const query = assertQuery(input.query);
    const limit = assertLimit(input.limit, INPUT_LIMITS.capabilityLimit, "capability limit");
    if (input.category !== undefined && typeof input.category !== "string") throw new TypeError("category must be a string");
    if (input.category !== undefined && !capabilities.some((capability) => capability.category === input.category)) throw new RangeError(`unknown category: ${input.category}`);
    return cloneImmutable(capabilities.filter((capability) => (!input.category || capability.category === input.category) && (!query || [capability.id, capability.label, capability.category, capability.summary].some((value) => normalizeRequirement(value).normalized.includes(query)))).slice(0, limit).map(toCapabilityDto));
  },
  listProjects: (input = {}) => {
    assertObject(input, "project query");
    const query = assertQuery(input.query);
    const limit = assertLimit(input.limit, INPUT_LIMITS.projectLimit, "project limit");
    if (input.capabilityIds !== undefined && !Array.isArray(input.capabilityIds)) throw new TypeError("capabilityIds must be an array");
    const capabilityIds = (input.capabilityIds ?? []).map((id) => {
      if (typeof id !== "string") throw new TypeError("capabilityIds must contain strings");
      return capabilityById(id).id;
    });
    if (input.maturity !== undefined && !projects.some((project) => project.maturity === input.maturity)) throw new RangeError(`unknown maturity: ${input.maturity}`);
    return cloneImmutable(projects.filter((project) => (!input.maturity || project.maturity === input.maturity) && capabilityIds.every((id) => project.capabilityIds.includes(id)) && (!query || [project.id, project.displayName, project.summary, project.productType].some((value) => normalizeRequirement(value).normalized.includes(query)))).slice(0, limit).map(toDossier));
  },
  getProject: (projectId) => cloneImmutable(toDossier(projectById(projectId))),
  matchRequirements: (input, provenance) => {
    assertObject(input, "match input");
    if (!Array.isArray(input.requirements)) throw new TypeError("requirements must be an array");
    const result = buildMatchResult(input.requirements);
    state.apply({ type: "match_evaluated", match: result, requirements: [...input.requirements], provenance });
    return result;
  },
  focusProject: (input, provenance) => {
    assertObject(input, "focus input");
    if (typeof input.projectId !== "string") throw new TypeError("projectId must be a string");
    const project = projectById(input.projectId);
    state.apply({ type: "project_focused", projectId: project.id, provenance });
    return cloneImmutable(toDossier(project));
  },
  createCollaborationBrief: (input, provenance) => {
    validateCollaborationBriefInput(input);
    const match = buildMatchResult(input.requirements);
    const brief = buildCollaborationBrief(input, match, provenance);
    state.apply({ type: "brief_created", match, requirements: [...input.requirements], brief, provenance });
    return brief;
  },
  updateCollaborationBrief: (input, provenance) => {
    assertObject(input, "brief update");
    const current = state.snapshot().collaborationDraft;
    if (!current) throw new RangeError("no collaboration brief is active");
    const nextInput: CollaborationBriefInput = { projectType: input.projectType ?? current.projectType, requirements: input.requirements ?? current.requirements, context: input.context ?? current.context, timeline: input.timeline ?? current.timeline, budget: input.budget ?? current.budget };
    validateCollaborationBriefInput(nextInput);
    const match = buildMatchResult(nextInput.requirements);
    const brief = buildCollaborationBrief(nextInput, match, provenance, current.id);
    state.apply({ type: "brief_updated", match, requirements: [...nextInput.requirements], brief, provenance });
    return brief;
  },
  clearMatch: (provenance) => state.apply({ type: "match_cleared", provenance }),
  close: (provenance) => state.apply({ type: "mode_closed", provenance }),
  reset: (provenance) => state.apply({ type: "semantic_reset", provenance }),
  setRegistrationState: (input, provenance) => {
    assertObject(input, "registration input");
    if (typeof input.webMcpAvailable !== "boolean") throw new TypeError("webMcpAvailable must be a boolean");
    if (!(["idle", "unavailable", "registering", "ready", "error"] as const).includes(input.registrationState)) throw new RangeError("unknown registration state");
    state.apply({ type: "registration_changed", ...input, provenance });
  },
});
