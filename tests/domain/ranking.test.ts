import { describe, expect, it } from "vitest";

import { collectEvidence } from "../../src/domain/collectEvidence";
import { evidenceRecords } from "../../src/domain/evidence";
import { normalizeRequirement } from "../../src/domain/normalizeRequirement";
import { projects } from "../../src/domain/projects";
import { rankProjects } from "../../src/domain/rankProjects";
import type { CollectedEvidence, RequirementDescriptor } from "../../src/domain/types";
import {
  buildMatchResult,
  buildMatchResultFromDataset,
} from "../../src/domain/matchRequirements";

const requirement = (id: string, original = id): RequirementDescriptor => ({
  id,
  ...normalizeRequirement(original),
});

describe("evidence-backed ranking", () => {
  it("uses one strongest evidence record per project and requirement", () => {
    // This catches duplicate evidence records increasing a project's score or matched-requirement count.
    const mcp = requirement("mcp", "MCP");
    const originalEvidence = evidenceRecords.find((record) => record.id === "bdb-mcp");
    expect(originalEvidence).toBeDefined();
    const duplicateEvidence = { ...originalEvidence!, id: "bdb-mcp-duplicate" };

    const ranked = rankProjects(
      [mcp],
      collectEvidence(mcp, [...evidenceRecords, duplicateEvidence]),
    );
    const bdb = ranked.find((project) => project.projectId === "bdb");

    expect(bdb).toMatchObject({ score: 1, matchedRequirementIds: ["mcp"] });
    expect(bdb?.evidence).toHaveLength(1);
    expect(bdb?.evidence[0]?.evidenceRecordId).toBe("bdb-mcp");
  });

  it("selects one strongest project record in requirement-level evidence output", () => {
    // This catches duplicated evidence from one project leaking into a requirement's public evidence IDs.
    const originalEvidence = evidenceRecords.find((record) => record.id === "bdb-mcp");
    expect(originalEvidence).toBeDefined();
    const duplicateEvidence = { ...originalEvidence!, id: "bdb-mcp-duplicate" };

    const result = buildMatchResultFromDataset(["MCP"], {
      projects,
      evidenceRecords: [...evidenceRecords, duplicateEvidence],
      dataVersion: "duplicate-evidence-test",
    });
    const mcp = result.requirements.find((requirement) => requirement.id === "mcp");

    expect(mcp?.evidenceRecordIds.filter((id) => id.startsWith("bdb-mcp"))).toEqual([
      "bdb-mcp",
    ]);
  });

  it("ranks score, exact-or-alias coverage, covered count, then project ID", () => {
    // This catches ordering that depends on input fixture order or ignores the locked tie-break sequence.
    const requirements = [requirement("first"), requirement("second")];
    const evidence = [
      {
        projectId: "distribution-desk",
        requirementId: "first",
        evidenceRecordId: "distribution-related-first",
        capabilityId: "electron",
        strength: 0.45,
        method: "related",
      },
      {
        projectId: "distribution-desk",
        requirementId: "second",
        evidenceRecordId: "distribution-related-second",
        capabilityId: "electron",
        strength: 0.45,
        method: "related",
      },
      {
        projectId: "bdb",
        requirementId: "first",
        evidenceRecordId: "bdb-alias-first",
        capabilityId: "mcp",
        strength: 0.9,
        method: "alias",
      },
      {
        projectId: "storyform",
        requirementId: "first",
        evidenceRecordId: "storyform-related-first",
        capabilityId: "electron",
        strength: 0.45,
        method: "related",
      },
      {
        projectId: "native-site-control",
        requirementId: "first",
        evidenceRecordId: "native-related-first",
        capabilityId: "control-contracts",
        strength: 0.45,
        method: "related",
      },
    ] satisfies readonly CollectedEvidence[];
    const sourceProjects = projects.filter((project) =>
      ["storyform", "native-site-control", "distribution-desk", "bdb"].includes(project.id),
    );

    expect(rankProjects(requirements, evidence, sourceProjects).map((project) => project.projectId)).toEqual([
      "bdb",
      "distribution-desk",
      "native-site-control",
      "storyform",
    ]);
  });

  it("keeps direct MCP evidence at full strength", () => {
    // This catches an exact canonical match being weakened by matching normalization or evidence collection.
    const result = buildMatchResult(["MCP"]);
    const bdb = result.rankedProjects.find((project) => project.projectId === "bdb");

    expect(bdb?.score).toBe(1);
    expect(bdb?.matchedRequirementIds).toHaveLength(1);
  });
});
