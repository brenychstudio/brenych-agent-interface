import { compareCodeUnits } from "./compareCodeUnits";
import { evidenceRecords } from "./evidence";
import { matchCapability } from "./matchCapability";
import type { CollectedEvidence, EvidenceRecord, RequirementDescriptor } from "./types";

const isStrongerEvidence = (
  candidate: CollectedEvidence,
  current: CollectedEvidence | undefined,
): boolean =>
  current === undefined ||
  candidate.strength > current.strength ||
  (candidate.strength === current.strength &&
    compareCodeUnits(candidate.evidenceRecordId, current.evidenceRecordId) < 0);

export const selectStrongestEvidence = (
  evidence: readonly CollectedEvidence[],
): readonly CollectedEvidence[] => {
  const selectedByProjectRequirement = new Map<string, CollectedEvidence>();

  evidence.forEach((candidate) => {
    const key = JSON.stringify([candidate.projectId, candidate.requirementId]);
    const current = selectedByProjectRequirement.get(key);
    if (isStrongerEvidence(candidate, current)) {
      selectedByProjectRequirement.set(key, candidate);
    }
  });

  return [...selectedByProjectRequirement.values()].sort(
    (left, right) =>
      compareCodeUnits(left.requirementId, right.requirementId) ||
      compareCodeUnits(left.projectId, right.projectId) ||
      right.strength - left.strength ||
      compareCodeUnits(left.evidenceRecordId, right.evidenceRecordId),
  );
};

export const collectEvidence = (
  requirement: RequirementDescriptor,
  records: readonly EvidenceRecord[] = evidenceRecords,
): readonly CollectedEvidence[] =>
  selectStrongestEvidence(
    records
      .map((record) => ({ record, match: matchCapability(requirement, record.capabilityId) }))
      .filter(({ match }) => match.strength > 0)
      .map(({ record, match }) => ({
        projectId: record.projectId,
        requirementId: requirement.id,
        evidenceRecordId: record.id,
        capabilityId: record.capabilityId,
        strength: match.strength,
        method: match.method,
      }) as CollectedEvidence)
      .sort(
        (left, right) =>
          compareCodeUnits(left.projectId, right.projectId) ||
          right.strength - left.strength ||
          compareCodeUnits(left.evidenceRecordId, right.evidenceRecordId),
      ),
  );
