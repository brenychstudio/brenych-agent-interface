import { describe, expect, it } from "vitest";

import { evidenceRecords } from "../../src/domain/evidence";
import {
  buildMatchResult,
  buildMatchResultFromDataset,
} from "../../src/domain/matchRequirements";
import { normalizeRequirement } from "../../src/domain/normalizeRequirement";
import { projects } from "../../src/domain/projects";

describe("requirement normalization and identity", () => {
  it("normalizes Unicode-compatible punctuation, case, and whitespace while preserving display text", () => {
    // This catches normalization that leaves punctuation, casing, or collapsed whitespace in the match key.
    expect(normalizeRequirement("  Model-Context   Protocol! ")).toEqual({
      original: "Model-Context   Protocol!",
      normalized: "model context protocol",
    });
  });

  it("keeps identity and coverage stable across permutations and normalized duplicates", () => {
    // This catches result identity or scoring that depends on requirement ordering or duplicate entries.
    const first = buildMatchResult(["Electron", "MCP", "Supabase"]);
    const second = buildMatchResult(["supabase", "Electron", "MCP", "MCP"]);

    expect(second.id).toBe(first.id);
    expect(second.evidenceCoverage).toBe(first.evidenceCoverage);
    expect(second.requirements.map((requirement) => requirement.original)).toEqual([
      "supabase",
      "Electron",
      "MCP",
    ]);
  });

  it("serializes canonical requirements injectively before hashing", () => {
    // This catches distinct normalized requirement sets colliding through delimiter-based serialization.
    const oneRequirement = buildMatchResult(["electron|mcp"]);
    const twoRequirements = buildMatchResult(["electron", "mcp"]);

    expect(oneRequirement.id).not.toBe(twoRequirements.id);
  });

  it("keeps MatchResult IDs distinct for a known 32-bit FNV collision", () => {
    // This catches restoring the previous eight-hex-digit FNV-1a identity helper.
    const first = buildMatchResult(["uzo3s02uk67hesp3"]);
    const second = buildMatchResult(["u021egu4rde6a9n0"]);

    expect(first.id).not.toBe(second.id);
    expect(first.id).toMatch(/^match-[0-9a-f]{16,}$/);
    expect(second.id).toMatch(/^match-[0-9a-f]{16,}$/);
  });

  it("exposes the authoritative requirement contract and derives classification IDs from it", () => {
    // This catches the legacy result shape or classifications maintained from a second, divergent source.
    const result = buildMatchResult(["MCP", "Swift"]);

    expect(result.requirements.map((requirement) => requirement.id)).toEqual(["mcp", "swift"]);
    expect(result.matched).toEqual(["mcp"]);
    expect(result.partial).toEqual([]);
    expect(result.missing).toEqual(["swift"]);
    expect(result.evidenceConfidence).toBe("medium");
    expect("requirementResults" in result).toBe(false);
    expect("deterministicConfidence" in result).toBe(false);
  });

  it("rejects count and length bounds before matching", () => {
    // This catches invalid requirement arrays reaching matching or identity generation.
    expect(() => buildMatchResult([])).toThrow("between 1 and 12 requirements");
    expect(() => buildMatchResult(["x".repeat(81)])).toThrow("must be 1 to 80 characters");
  });

  it("binds lower-level result identity and returned data version to its required dataset", () => {
    // This catches an injected or versioned dataset silently claiming the approved dataset identity.
    const first = buildMatchResultFromDataset(["MCP"], {
      projects,
      evidenceRecords,
      dataVersion: "test-data-a",
    });
    const second = buildMatchResultFromDataset(["MCP"], {
      projects,
      evidenceRecords,
      dataVersion: "test-data-b",
    });

    expect(first.dataVersion).toBe("test-data-a");
    expect(second.dataVersion).toBe("test-data-b");
    expect(first.id).not.toBe(second.id);
    expect(() =>
      buildMatchResultFromDataset(["MCP"], {
        projects,
        evidenceRecords,
        dataVersion: "   ",
      }),
    ).toThrow("dataVersion must not be empty");
  });

  it("deep-freezes result outputs without freezing fixture inputs", () => {
    // This catches mutable result subgraphs or deep-freeze implementations that mutate shared fixture inputs.
    expect(Object.isFrozen(projects)).toBe(false);
    expect(Object.isFrozen(evidenceRecords)).toBe(false);
    const result = buildMatchResult(["MCP", "Swift"]);

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.labels)).toBe(true);
    expect(Object.isFrozen(result.requirements)).toBe(true);
    expect(Object.isFrozen(result.requirements[0])).toBe(true);
    expect(Object.isFrozen(result.requirements[0]?.evidenceRecordIds)).toBe(true);
    expect(Object.isFrozen(result.rankedProjects)).toBe(true);
    expect(Object.isFrozen(result.rankedProjects[0])).toBe(true);
    expect(Object.isFrozen(result.rankedProjects[0]?.evidence)).toBe(true);
    expect(Object.isFrozen(result.rankedProjects[0]?.evidence[0])).toBe(true);
    expect(Object.isFrozen(result.matched)).toBe(true);
    expect(Object.isFrozen(result.partial)).toBe(true);
    expect(Object.isFrozen(result.missing)).toBe(true);
    expect(Object.isFrozen(projects)).toBe(false);
    expect(Object.isFrozen(evidenceRecords)).toBe(false);
  });
});
