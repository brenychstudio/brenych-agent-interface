import { collectEvidence, selectStrongestEvidence } from "./collectEvidence";
import { compareCodeUnits } from "./compareCodeUnits";
import { evidenceRecords } from "./evidence";
import { PUBLIC_EVIDENCE_DATA_VERSION } from "./profile";
import { projects } from "./projects";
import { rankProjects, scoreRequirementCoverage } from "./rankProjects";
import { normalizeRequirement } from "./normalizeRequirement";
import { stableHash } from "./stableHash";
import type {
  CollectedEvidence,
  MatchDataset,
  MatchResult,
  RequirementDescriptor,
  RequirementResult,
} from "./types";

const METHOD_VERSION = "1.0.0" as const;

const labels = {
  coverage: "EVIDENCE COVERAGE",
  matched: "MATCHED",
  partial: "PARTIAL",
  missing: "NOT DEMONSTRATED",
} as const;

const approvedDataset: MatchDataset = {
  projects,
  evidenceRecords,
  dataVersion: PUBLIC_EVIDENCE_DATA_VERSION,
};

const validateRequirements = (requirements: readonly string[]): void => {
  if (requirements.length < 1 || requirements.length > 12) {
    throw new RangeError("requirements must contain between 1 and 12 requirements");
  }

  requirements.forEach((requirement, index) => {
    if (requirement.length < 1 || requirement.length > 80) {
      throw new RangeError(`requirement ${index + 1} must be 1 to 80 characters`);
    }
  });
};

const validateDataset = (dataset: MatchDataset): void => {
  if (!Array.isArray(dataset.projects) || !Array.isArray(dataset.evidenceRecords)) {
    throw new TypeError("dataset must provide projects and evidenceRecords arrays");
  }
  if (dataset.dataVersion.trim().length === 0) {
    throw new RangeError("dataVersion must not be empty");
  }
};

const deepFreeze = <Value>(value: Value): Value => {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach((nestedValue) => {
      deepFreeze(nestedValue);
    });
    Object.freeze(value);
  }
  return value;
};

const uniqueRequirements = (requirements: readonly string[]): readonly RequirementDescriptor[] => {
  const uniqueByNormalized = new Map<string, RequirementDescriptor>();

  requirements.forEach((requirement) => {
    const normalized = normalizeRequirement(requirement);
    if (!normalized.normalized) {
      throw new RangeError("requirements must contain a non-punctuation term");
    }
    if (!uniqueByNormalized.has(normalized.normalized)) {
      uniqueByNormalized.set(normalized.normalized, { id: normalized.normalized, ...normalized });
    }
  });

  return [...uniqueByNormalized.values()];
};

const buildRequirements = (
  requirements: readonly RequirementDescriptor[],
  evidence: readonly CollectedEvidence[],
): readonly RequirementResult[] =>
  requirements.map((requirement) => {
    const strongestStrength = evidence
      .filter((candidate) => candidate.requirementId === requirement.id)
      .reduce<number>((strongest, candidate) => Math.max(strongest, candidate.strength), 0) as RequirementResult["strength"];
    const strongestEvidence = evidence
      .filter(
        (candidate) =>
          candidate.requirementId === requirement.id && candidate.strength === strongestStrength,
      )
      .sort(
        (left, right) =>
          right.strength - left.strength ||
          compareCodeUnits(left.projectId, right.projectId) ||
          compareCodeUnits(left.evidenceRecordId, right.evidenceRecordId),
      );
    const firstEvidence = strongestEvidence[0];

    return {
      id: requirement.id,
      original: requirement.original,
      normalized: requirement.normalized,
      label: strongestStrength === 0 ? "missing" : strongestStrength === 0.45 ? "partial" : "matched",
      strength: strongestStrength,
      capabilityId: firstEvidence?.capabilityId,
      evidenceRecordIds: evidence
        .filter((candidate) => candidate.requirementId === requirement.id)
        .sort(
          (left, right) =>
            right.strength - left.strength ||
            compareCodeUnits(left.projectId, right.projectId) ||
            compareCodeUnits(left.evidenceRecordId, right.evidenceRecordId),
        )
        .map((candidate) => candidate.evidenceRecordId),
    };
  });

const evidenceConfidence = (coverage: number): MatchResult["evidenceConfidence"] => {
  if (coverage >= 0.75) return "high";
  if (coverage >= 0.35) return "medium";
  return "limited";
};

export const buildMatchResultFromDataset = (
  inputRequirements: readonly string[],
  dataset: MatchDataset,
): MatchResult => {
  validateRequirements(inputRequirements);
  validateDataset(dataset);
  const requirementDescriptors = uniqueRequirements(inputRequirements);
  const selectedEvidence = selectStrongestEvidence(
    requirementDescriptors.flatMap((requirement) =>
      collectEvidence(requirement, dataset.evidenceRecords),
    ),
  );
  const requirements = buildRequirements(requirementDescriptors, selectedEvidence);
  const evidenceCoverage = scoreRequirementCoverage(requirementDescriptors, selectedEvidence);
  const canonicalRequirements = requirementDescriptors
    .map((requirement) => requirement.normalized)
    .sort(compareCodeUnits);
  const matched =
    requirements.filter((requirement) => requirement.label === "matched").map((requirement) => requirement.id);
  const partial =
    requirements.filter((requirement) => requirement.label === "partial").map((requirement) => requirement.id);
  const missing =
    requirements.filter((requirement) => requirement.label === "missing").map((requirement) => requirement.id);

  return deepFreeze({
    id: `match-${stableHash(
      `${METHOD_VERSION}|${dataset.dataVersion}|${JSON.stringify(canonicalRequirements)}`,
    )}`,
    requirements,
    evidenceCoverage,
    evidenceConfidence: evidenceConfidence(evidenceCoverage),
    matched,
    partial,
    missing,
    labels: { ...labels },
    rankedProjects: rankProjects(
      requirementDescriptors,
      selectedEvidence,
      dataset.projects,
    ),
    methodVersion: METHOD_VERSION,
    dataVersion: dataset.dataVersion,
  });
};

export const buildMatchResult = (inputRequirements: readonly string[]): MatchResult =>
  buildMatchResultFromDataset(inputRequirements, approvedDataset);
