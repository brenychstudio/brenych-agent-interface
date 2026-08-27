import { capabilities, relatedCapabilityEdges } from "./capabilities";
import { normalizeRequirement } from "./normalizeRequirement";
import type {
  CapabilityId,
  CapabilityMatch,
  CapabilityResolution,
  NormalizedRequirement,
} from "./types";

const canonicalCapabilityIds = new Map(
  capabilities.flatMap((capability) =>
    [capability.id, capability.label].map(
      (term) => [normalizeRequirement(term).normalized, capability.id] as const,
    ),
  ),
);

const capabilityAliases = new Map(
  capabilities.flatMap((capability) =>
    capability.aliases.map((alias) => [normalizeRequirement(alias).normalized, capability.id] as const),
  ),
);

const relatedCapabilityKeys = new Set(
  relatedCapabilityEdges.map((edge) => `${edge.from}:${edge.to}`),
);

const normalizedValue = (requirement: string | NormalizedRequirement): string =>
  typeof requirement === "string"
    ? normalizeRequirement(requirement).normalized
    : requirement.normalized;

export const resolveCapabilityAlias = (
  requirement: string | NormalizedRequirement,
): CapabilityResolution | undefined => {
  const normalized = normalizedValue(requirement);
  const canonicalId = canonicalCapabilityIds.get(normalized);

  if (canonicalId) {
    return { capabilityId: canonicalId, strength: 1, method: "exact" };
  }

  const aliasId = capabilityAliases.get(normalized);
  return aliasId ? { capabilityId: aliasId, strength: 0.9, method: "alias" } : undefined;
};

export const matchCapability = (
  requirement: string | NormalizedRequirement,
  candidateCapabilityId: CapabilityId,
): CapabilityMatch => {
  const resolution = resolveCapabilityAlias(requirement);

  if (!resolution) {
    return { candidateCapabilityId, strength: 0, method: "missing" };
  }

  if (resolution.capabilityId === candidateCapabilityId) {
    return { ...resolution, requirementCapabilityId: resolution.capabilityId, candidateCapabilityId };
  }

  if (relatedCapabilityKeys.has(`${resolution.capabilityId}:${candidateCapabilityId}`)) {
    return {
      requirementCapabilityId: resolution.capabilityId,
      candidateCapabilityId,
      strength: 0.45,
      method: "related",
    };
  }

  return {
    requirementCapabilityId: resolution.capabilityId,
    candidateCapabilityId,
    strength: 0,
    method: "missing",
  };
};
