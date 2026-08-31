import type { AgentInterface } from "../application/AgentInterface";
import { capabilities } from "../domain/capabilities";
import { INPUT_LIMITS } from "../domain/limits";
import { normalizeRequirement } from "../domain/normalizeRequirement";
import { projects } from "../domain/projects";
import type { CapabilityId, ProjectId, ProjectMaturity } from "../domain/types";
import { cancelledResult, toToolFailure, toolSuccess, type ToolResult } from "./toolResults";
import type { WebMcpToolDefinition } from "./webMcpPort";

type JsonRecord = Record<string, unknown>;

const projectIds = projects.map((project) => project.id) as readonly ProjectId[];
const capabilityIds = capabilities.map((capability) => capability.id) as readonly CapabilityId[];
const capabilityCategories = [...new Set(capabilities.map((capability) => capability.category))];
const projectMaturities = [...new Set(projects.map((project) => project.maturity))] as readonly ProjectMaturity[];

const objectSchema = (properties: JsonRecord, required: readonly string[] = []): JsonRecord => ({
  type: "object",
  properties,
  required,
  additionalProperties: false,
});

// JSON Schema patterns stay in the portable non-whitespace subset; runtime normalization enforces semantic non-punctuation terms.
const nonWhitespacePattern = ".*\\S.*";

const requirementsSchema = {
  type: "array",
  description: "One or more needs to evaluate against the workspace's public evidence.",
  minItems: 1,
  maxItems: INPUT_LIMITS.requirementCount,
  items: {
    type: "string",
    description: "A single concrete requirement, such as a technology, workflow, or capability.",
    minLength: 1,
    maxLength: INPUT_LIMITS.requirementLength,
    pattern: nonWhitespacePattern,
  },
};

const schema = {
  empty: objectSchema({}),
  capabilities: objectSchema({
    query: { type: "string", description: "Optional text to filter the capability catalog.", maxLength: INPUT_LIMITS.queryLength },
    category: { type: "string", description: "Optional exact capability category to include.", enum: capabilityCategories },
    limit: { type: "integer", description: "Maximum number of capabilities to return.", minimum: 1, maximum: INPUT_LIMITS.capabilityLimit },
  }),
  projects: objectSchema({
    query: { type: "string", description: "Optional text to filter public project summaries.", maxLength: INPUT_LIMITS.queryLength },
    capabilityIds: {
      type: "array",
      description: "Optional capability IDs that every returned project must support.",
      uniqueItems: true,
      maxItems: capabilityIds.length,
      items: { type: "string", description: "One public capability ID required of each project.", enum: capabilityIds },
    },
    maturity: { type: "string", description: "Optional exact maturity level for returned projects.", enum: projectMaturities },
    limit: { type: "integer", description: "Maximum number of project summaries to return.", minimum: 1, maximum: INPUT_LIMITS.projectLimit },
  }),
  project: objectSchema({ projectId: { type: "string", description: "The ID of the public project to read or focus.", enum: projectIds } }, ["projectId"]),
  match: objectSchema({ requirements: requirementsSchema }, ["requirements"]),
  brief: objectSchema({
    projectType: { type: "string", description: "A short label for the proposed collaboration or project type.", minLength: 1, maxLength: INPUT_LIMITS.projectTypeLength, pattern: nonWhitespacePattern },
    requirements: requirementsSchema,
    context: { type: "string", description: "Optional project context to include in the page-local editable brief.", maxLength: INPUT_LIMITS.contextLength },
    timeline: { type: "string", description: "Optional timeline note for the editable brief.", maxLength: INPUT_LIMITS.timelineLength },
    budget: { type: "string", description: "Optional budget note for the editable brief.", maxLength: INPUT_LIMITS.budgetLength },
  }, ["projectType", "requirements"]),
} as const;

const isRecord = (value: unknown): value is JsonRecord => value !== null && typeof value === "object" && !Array.isArray(value);

const requireRecord = (input: unknown, allowed: readonly string[]): JsonRecord => {
  if (!isRecord(input)) throw new TypeError("input must be an object");
  if (Object.keys(input).some((key) => !allowed.includes(key))) throw new TypeError("input contains an unknown field");
  return input;
};

const optionalString = (input: JsonRecord, field: string, maximum: number): string | undefined => {
  const value = input[field];
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.length > maximum) throw new RangeError(`${field} is invalid`);
  return value;
};

const optionalLimit = (input: JsonRecord, maximum: number): number | undefined => {
  const value = input.limit;
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > maximum) throw new RangeError("limit is invalid");
  return value;
};

const requiredRequirements = (input: JsonRecord): readonly string[] => {
  const value = input.requirements;
  if (!Array.isArray(value) || value.length < 1 || value.length > INPUT_LIMITS.requirementCount || value.some((item) => typeof item !== "string" || item.length < 1 || item.length > INPUT_LIMITS.requirementLength || normalizeRequirement(item).normalized.length === 0)) {
    throw new RangeError("requirements are invalid");
  }
  return value;
};

type ProjectDossier = ReturnType<AgentInterface["getProject"]>;

const compactProjectSummary = (project: ProjectDossier): JsonRecord => ({
  id: project.id,
  title: project.title,
  ...(project.publicEvidenceName ? { publicEvidenceName: project.publicEvidenceName } : {}),
  summary: project.summary,
  maturity: project.maturity,
  maturityLabel: project.maturityLabel,
  visibility: project.visibility,
  capabilityIds: project.capabilities.map((capability) => capability.id),
  links: project.links,
  limitations: project.limitations,
});

const compactProjectDossier = (project: ProjectDossier): JsonRecord => ({
  id: project.id,
  title: project.title,
  ...(project.publicEvidenceName ? { publicEvidenceName: project.publicEvidenceName } : {}),
  summary: project.summary,
  productType: project.productType,
  maturity: project.maturity,
  maturityLabel: project.maturityLabel,
  visibility: project.visibility,
  verificationLevels: project.verificationLevels,
  verifiedHighlights: project.verifiedHighlights,
  capabilities: project.capabilities.map(({ id, label, category }) => ({ id, label, category })),
  evidence: project.evidence.map(({ id, claim, visibility, verificationLevel, sourceLabel, sourceReference }) => ({
    id,
    claim,
    visibility,
    verificationLevel,
    sourceLabel,
    ...(sourceReference ? { sourceReference } : {}),
  })),
  links: project.links,
  limitations: project.limitations,
});

const execute = (handler: (input: unknown, signal: AbortSignal) => object): WebMCP.ToolExecuteCallback =>
  async (input, { signal }): Promise<ToolResult> => {
    if (signal.aborted) return cancelledResult();
    try {
      return toolSuccess(handler(input, signal) as Record<string, unknown>);
    } catch (error) {
      if (signal.aborted) return cancelledResult();
      return toToolFailure(error);
    }
  };

export const createToolDefinitions = (agent: AgentInterface): readonly WebMcpToolDefinition[] => [
  {
    name: "get_profile",
    title: "Get public profile",
    description: "Read the public profile for this public evidence workspace.",
    inputSchema: schema.empty,
    annotations: { readOnlyHint: true },
    execute: execute((input) => {
      requireRecord(input, []);
      return agent.getProfile();
    }),
  },
  {
    name: "get_capabilities",
    title: "List capabilities",
    description: "List the public capability catalog; use match_requirements to evaluate a supplied set of needs.",
    inputSchema: schema.capabilities,
    annotations: { readOnlyHint: true },
    execute: execute((input) => {
      const value = requireRecord(input, ["query", "category", "limit"]);
      const query = optionalString(value, "query", INPUT_LIMITS.queryLength);
      const category = optionalString(value, "category", INPUT_LIMITS.queryLength);
      if (category !== undefined && !capabilityCategories.includes(category)) throw new RangeError("category is invalid");
      const limit = optionalLimit(value, INPUT_LIMITS.capabilityLimit);
      return { capabilities: agent.getCapabilities({ query, category, limit }) };
    }),
  },
  {
    name: "list_projects",
    title: "List public projects",
    description: "List compact public project summaries that match optional filters.",
    inputSchema: schema.projects,
    annotations: { readOnlyHint: true },
    execute: execute((input) => {
      const value = requireRecord(input, ["query", "capabilityIds", "maturity", "limit"]);
      const query = optionalString(value, "query", INPUT_LIMITS.queryLength);
      const maturity = optionalString(value, "maturity", INPUT_LIMITS.queryLength);
      if (maturity !== undefined && !projectMaturities.some((candidate) => candidate === maturity)) throw new RangeError("maturity is invalid");
      const rawCapabilityIds = value.capabilityIds;
      if (rawCapabilityIds !== undefined && (!Array.isArray(rawCapabilityIds) || rawCapabilityIds.length > capabilityIds.length || rawCapabilityIds.some((id) => typeof id !== "string" || !capabilityIds.some((candidate) => candidate === id)))) throw new RangeError("capabilityIds are invalid");
      const limit = optionalLimit(value, INPUT_LIMITS.projectLimit);
      return { projects: agent.listProjects({ query, maturity: maturity as ProjectMaturity | undefined, capabilityIds: rawCapabilityIds as readonly CapabilityId[] | undefined, limit }).map(compactProjectSummary) };
    }),
  },
  {
    name: "get_project",
    title: "Get project dossier",
    description: "Read the detailed public evidence dossier for one project without changing workspace focus.",
    inputSchema: schema.project,
    annotations: { readOnlyHint: true },
    execute: execute((input) => {
      const value = requireRecord(input, ["projectId"]);
      const projectId = value.projectId;
      if (typeof projectId !== "string" || !projectIds.includes(projectId as ProjectId)) throw new RangeError("projectId is invalid");
      return compactProjectDossier(agent.getProject(projectId as ProjectId));
    }),
  },
  {
    name: "match_requirements",
    title: "Match requirements",
    description: "Evaluate supplied requirements against this workspace's public evidence and update its visible page-local match state.",
    inputSchema: schema.match,
    annotations: { readOnlyHint: false, untrustedContentHint: true },
    execute: execute((input, signal) => {
      const value = requireRecord(input, ["requirements"]);
      const requirements = requiredRequirements(value);
      if (signal.aborted) throw new DOMException("Tool execution was cancelled", "AbortError");
      const match = agent.matchRequirements({ requirements }, "webmcp");
      return {
        id: match.id,
        evidenceCoverage: match.evidenceCoverage,
        evidenceConfidence: match.evidenceConfidence,
        matched: match.matched,
        partial: match.partial,
        missing: match.missing,
        rankedProjects: match.rankedProjects.map((project) => ({ projectId: project.projectId, score: project.score })),
      };
    }),
  },
  {
    name: "focus_project",
    title: "Focus project",
    description: "Visibly focus and open one public project in the shared workspace Inspect surface.",
    inputSchema: schema.project,
    annotations: { readOnlyHint: false },
    execute: execute((input, signal) => {
      const value = requireRecord(input, ["projectId"]);
      const projectId = value.projectId;
      if (typeof projectId !== "string" || !projectIds.includes(projectId as ProjectId)) throw new RangeError("projectId is invalid");
      if (signal.aborted) throw new DOMException("Tool execution was cancelled", "AbortError");
      return compactProjectSummary(agent.focusProject({ projectId: projectId as ProjectId }, "webmcp"));
    }),
  },
  {
    name: "create_collaboration_brief",
    title: "Create collaboration brief",
    description: "Create a page-local editable collaboration brief from bounded requirements without sending it anywhere.",
    inputSchema: schema.brief,
    annotations: { readOnlyHint: false, untrustedContentHint: true },
    execute: execute((input, signal) => {
      const value = requireRecord(input, ["projectType", "requirements", "context", "timeline", "budget"]);
      const projectType = optionalString(value, "projectType", INPUT_LIMITS.projectTypeLength);
      if (!projectType || projectType.trim().length === 0) throw new RangeError("projectType is invalid");
      const requirements = requiredRequirements(value);
      const context = optionalString(value, "context", INPUT_LIMITS.contextLength);
      const timeline = optionalString(value, "timeline", INPUT_LIMITS.timelineLength);
      const budget = optionalString(value, "budget", INPUT_LIMITS.budgetLength);
      if (signal.aborted) throw new DOMException("Tool execution was cancelled", "AbortError");
      const brief = agent.createCollaborationBrief({ projectType, requirements, context, timeline, budget }, "webmcp");
      return {
        id: brief.id,
        projectType: brief.projectType,
        requirementCount: brief.requirements.length,
        relevantProjectIds: brief.relevantProjectIds,
        knownGaps: brief.knownGaps,
        sourceMatchId: brief.sourceMatchId,
      };
    }),
  },
];
