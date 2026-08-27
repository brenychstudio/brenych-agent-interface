import { normalizeRequirement } from "./normalizeRequirement";
import type { Capability, EvidenceRecord, Project } from "./types";

export interface FixtureGraph {
  readonly projects: readonly Project[];
  readonly capabilities: readonly Capability[];
  readonly evidenceRecords: readonly EvidenceRecord[];
}

const hasDuplicates = (values: readonly string[]): boolean =>
  new Set(values).size !== values.length;

const isSafePublicReference = (reference: string): boolean => {
  if (reference.includes("\\")) {
    return false;
  }

  if (reference.startsWith("/") && !reference.startsWith("//")) {
    return true;
  }

  try {
    const url = new URL(reference);
    return url.protocol === "https:" && url.hostname.length > 0;
  } catch {
    return false;
  }
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Invalid public evidence fixtures: ${message}`);
  }
}

export const assertFixtureIntegrity = ({
  projects,
  capabilities,
  evidenceRecords,
}: FixtureGraph): void => {
  assert(projects.length === 7, "exactly seven projects are required");
  assert(!hasDuplicates(projects.map((project) => project.id)), "duplicate project IDs");
  assert(
    !hasDuplicates(capabilities.map((capability) => capability.id)),
    "duplicate capability IDs",
  );
  assert(
    !hasDuplicates(evidenceRecords.map((record) => record.id)),
    "duplicate evidence record IDs",
  );

  const capabilityTermOwners = new Map<string, string>();
  for (const capability of capabilities) {
    for (const term of [capability.id, capability.label, ...capability.aliases]) {
      const normalized = normalizeRequirement(term).normalized;
      const existingOwner = capabilityTermOwners.get(normalized);
      assert(
        existingOwner === undefined || existingOwner === capability.id,
        `ambiguous normalized capability term ${normalized}`,
      );
      capabilityTermOwners.set(normalized, capability.id);
    }
  }

  const projectIds = new Set(projects.map((project) => project.id));
  const capabilityIds = new Set(capabilities.map((capability) => capability.id));
  const evidencedCapabilityIds = new Set(evidenceRecords.map((record) => record.capabilityId));

  for (const project of projects) {
    assert(project.limitations.length > 0, `project ${project.id} has no limitations`);
    assert(
      project.limitations.every((limitation) => limitation.trim().length > 0),
      `project ${project.id} has an empty limitation`,
    );
    assert(
      project.capabilityIds.every((capabilityId) => capabilityIds.has(capabilityId)),
      `project ${project.id} references an unknown capability`,
    );
    assert(
      project.links.every((link) => isSafePublicReference(link.href)),
      `project ${project.id} has an unsafe link`,
    );
    assert(
      project.visibility !== "public_summary_only" || project.links.length === 0,
      `summary-only project ${project.id} exposes a public link`,
    );
  }

  for (const record of evidenceRecords) {
    assert(projectIds.has(record.projectId), `evidence ${record.id} has a dangling project`);
    assert(
      capabilityIds.has(record.capabilityId),
      `evidence ${record.id} has a dangling capability`,
    );
    assert(record.claim.trim().length > 0, `evidence ${record.id} has no claim`);
    assert(record.sourceLabel.trim().length > 0, `evidence ${record.id} has no provenance label`);
    if (record.sourceReference !== undefined) {
      assert(
        isSafePublicReference(record.sourceReference),
        `evidence ${record.id} has unsafe or missing provenance`,
      );
    }

    const project = projects.find(({ id }) => id === record.projectId);
    assert(
      project?.capabilityIds.includes(record.capabilityId) ?? false,
      `evidence ${record.id} is not declared by project ${record.projectId}`,
    );
  }

  for (const capability of capabilities) {
    assert(
      evidencedCapabilityIds.has(capability.id),
      `capability ${capability.id} has no evidence`,
    );
    assert(
      capability.relatedCapabilityIds.every((relatedId) => capabilityIds.has(relatedId)),
      `capability ${capability.id} has an unknown related capability`,
    );
  }

  for (const project of projects) {
    for (const capabilityId of project.capabilityIds) {
      assert(
        evidenceRecords.some(
          (record) => record.projectId === project.id && record.capabilityId === capabilityId,
        ),
        `project ${project.id} has no evidence for capability ${capabilityId}`,
      );
    }
  }
};
