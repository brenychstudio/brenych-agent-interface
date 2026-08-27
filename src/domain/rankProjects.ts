import { compareCodeUnits } from "./compareCodeUnits";
import { selectStrongestEvidence } from "./collectEvidence";
import { projects } from "./projects";
import type { CollectedEvidence, Project, RankedProject, RequirementDescriptor } from "./types";

const strongestEvidence = (
  requirementId: string,
  projectId: string,
  evidence: readonly CollectedEvidence[],
): CollectedEvidence | undefined =>
  evidence
    .filter(
      (candidate) =>
        candidate.requirementId === requirementId && candidate.projectId === projectId,
    )
    .sort(
      (left, right) =>
        right.strength - left.strength ||
        compareCodeUnits(left.evidenceRecordId, right.evidenceRecordId),
    )[0];

export const scoreRequirementCoverage = (
  requirements: readonly RequirementDescriptor[],
  evidence: readonly CollectedEvidence[],
): number => {
  if (requirements.length === 0) return 0;

  return (
    requirements.reduce((total, requirement) => {
      const strength = evidence
        .filter((candidate) => candidate.requirementId === requirement.id)
        .reduce((strongest, candidate) => Math.max(strongest, candidate.strength), 0);
      return total + strength;
    }, 0) / requirements.length
  );
};

export const rankProjects = (
  requirements: readonly RequirementDescriptor[],
  evidence: readonly CollectedEvidence[],
  sourceProjects: readonly Project[] = projects,
): readonly RankedProject[] => {
  const selectedSourceEvidence = selectStrongestEvidence(evidence);

  return sourceProjects
    .map((project) => {
      const selectedEvidence = requirements
        .map((requirement) => strongestEvidence(requirement.id, project.id, selectedSourceEvidence))
        .filter((candidate): candidate is CollectedEvidence => candidate !== undefined);
      const matchedRequirementIds = selectedEvidence
        .filter((candidate) => candidate.strength === 1 || candidate.strength === 0.9)
        .map((candidate) => candidate.requirementId);
      const partialRequirementIds = selectedEvidence
        .filter((candidate) => candidate.strength === 0.45)
        .map((candidate) => candidate.requirementId);
      const coveredRequirementIds = new Set(selectedEvidence.map((candidate) => candidate.requirementId));

      return {
        projectId: project.id,
        score:
          requirements.length === 0
            ? 0
            : selectedEvidence.reduce((total, candidate) => total + candidate.strength, 0) /
              requirements.length,
        matchedRequirementIds,
        partialRequirementIds,
        missingRequirementIds: requirements
          .filter((requirement) => !coveredRequirementIds.has(requirement.id))
          .map((requirement) => requirement.id),
        evidence: selectedEvidence,
      };
    })
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.matchedRequirementIds.length - left.matchedRequirementIds.length ||
        right.evidence.length - left.evidence.length ||
        compareCodeUnits(left.projectId, right.projectId),
    );
};
