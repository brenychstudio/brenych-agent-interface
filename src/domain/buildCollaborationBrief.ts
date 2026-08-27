import { compareCodeUnits } from "./compareCodeUnits";
import { INPUT_LIMITS } from "./limits";
import { stableHash } from "./stableHash";
import type { CollaborationBrief, MatchResult, ProjectId } from "./types";

export interface CollaborationBriefInput {
  readonly projectType: string;
  readonly requirements: readonly string[];
  readonly context?: string;
  readonly timeline?: string;
  readonly budget?: string;
}

const freeze = <Value>(value: Value): Value => {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach((nestedValue) => freeze(nestedValue));
    Object.freeze(value);
  }
  return value;
};

const assertText = (field: string, value: unknown, maximum: number, required = false): void => {
  if (value === undefined && !required) return;
  if (typeof value !== "string" || (required && value.trim().length === 0)) {
    throw new RangeError(`${field} is required`);
  }
  if (value.length > maximum) throw new RangeError(`${field} must be at most ${maximum} characters`);
};

export const validateCollaborationBriefInput = (input: CollaborationBriefInput): void => {
  if (input === null || typeof input !== "object" || Array.isArray(input)) throw new TypeError("brief input must be an object");
  assertText("projectType", input.projectType, INPUT_LIMITS.projectTypeLength, true);
  if (!Array.isArray(input.requirements)) throw new TypeError("requirements must be an array");
  assertText("context", input.context, INPUT_LIMITS.contextLength);
  assertText("timeline", input.timeline, INPUT_LIMITS.timelineLength);
  assertText("budget", input.budget, INPUT_LIMITS.budgetLength);
};

export const buildCollaborationBrief = (
  input: CollaborationBriefInput,
  match: MatchResult,
  provenance: CollaborationBrief["provenance"],
  id?: string,
): CollaborationBrief => {
  validateCollaborationBriefInput(input);
  const relevantProjectIds = match.rankedProjects
    .filter((project) => project.score > 0)
    .slice(0, 3)
    .map((project) => project.projectId) as readonly ProjectId[];
  const projectType = input.projectType.trim();
  const context = (input.context ?? "").trim();
  const timeline = (input.timeline ?? "").trim();
  const budget = (input.budget ?? "").trim();
  const draftId = id ?? `brief-${stableHash(JSON.stringify([match.id, projectType, context, timeline, budget]))}`;

  return freeze({
    id: draftId,
    projectType,
    requirements: [...input.requirements],
    context,
    timeline,
    budget,
    relevantProjectIds,
    knownGaps: [...match.missing].sort(compareCodeUnits),
    sourceMatchId: match.id,
    provenance,
  });
};
