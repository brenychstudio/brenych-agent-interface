import { describe, expect, it } from "vitest";

import { buildCollaborationBrief } from "../../src/domain/buildCollaborationBrief";
import { evidenceRecords } from "../../src/domain/evidence";
import { buildMatchResult } from "../../src/domain/matchRequirements";
import { projects } from "../../src/domain/projects";
import {
  evidenceVisibilityLabel,
  projectVisibilityLabel,
  verificationLevelLabel,
} from "../../src/presentation/displayLabels";
import { evidenceMedia } from "../../src/presentation/evidenceMedia";
import { showcaseProofs } from "../../src/presentation/showcaseProofs";

const scenarioA = ["Electron", "MCP", "AI automation", "Supabase"] as const;

describe("supporting studio proof separation", () => {
  it("keeps exactly four showcase systems outside the seven-project evidence graph", () => {
    // This catches a showcase system being appended to the scored project fixtures.
    expect(projects).toHaveLength(7);
    expect(showcaseProofs.map((proof) => proof.id)).toEqual([
      "webhero",
      "photo-web",
      "artist-stage",
      "model-site",
    ]);
    expect(showcaseProofs.every((proof) => proof.scoring === false)).toBe(true);

    const coreIds = new Set(projects.map((project) => project.id));
    const showcaseIds = new Set(showcaseProofs.map((proof) => proof.id));
    expect([...showcaseIds].every((id) => !coreIds.has(id as never))).toBe(true);
    expect(evidenceRecords.every((record) => coreIds.has(record.projectId))).toBe(true);
    expect(evidenceRecords.some((record) => showcaseIds.has(record.projectId as never))).toBe(false);
  });

  it("binds every showcase record to approved media without creating scoring evidence", () => {
    // This catches a visual proof record drifting from the approved 15-asset registry.
    const mediaById = new Map(evidenceMedia.map((item) => [item.id, item]));
    for (const proof of showcaseProofs) {
      expect(proof.mediaIds).toHaveLength(2);
      expect(proof.mediaIds.map((id) => mediaById.get(id)?.ownerId)).toEqual([
        proof.id,
        proof.id,
      ]);
      expect(proof.relatedCapabilityIds.length).toBeGreaterThan(0);
    }
  });

  it("cannot change coverage, ranking, stable match identity, or brief project IDs", () => {
    // This catches presentation data leaking into matching or brief derivation.
    const result = buildMatchResult(scenarioA);
    const brief = buildCollaborationBrief(
      { projectType: "Desktop agent workspace", requirements: scenarioA },
      result,
      "manual",
    );
    const showcaseIds = new Set(showcaseProofs.map((proof) => proof.id));

    expect(result.id).toBe("match-12eeaddb6f02995c");
    expect(result.evidenceCoverage).toBe(1);
    expect(result.rankedProjects).toHaveLength(7);
    expect(result.rankedProjects.slice(0, 3).map((project) => project.projectId)).toEqual([
      "bdb",
      "weekfield",
      "distribution-desk",
    ]);
    expect(result.rankedProjects.some((project) => showcaseIds.has(project.projectId as never))).toBe(false);
    expect(brief.relevantProjectIds).toEqual(["bdb", "weekfield", "distribution-desk"]);
    expect(brief.relevantProjectIds.some((id) => showcaseIds.has(id as never))).toBe(false);
  });

  it("adds display-only verified highlights and honest public labels to every core project", () => {
    // This catches enriched evidence copy becoming incomplete or exposing raw internal enum labels.
    expect(projects.every((project) => project.verifiedHighlights.length >= 3)).toBe(true);
    expect(projects.find((project) => project.id === "weekfield")).toMatchObject({
      maturityLabel: "PRODUCTION-CONNECTED PAID SAAS RELEASE CANDIDATE · CONTROLLED BETA",
      verifiedHighlights: expect.arrayContaining(["Deterministic Smart Mix", "Planet Field"]),
    });
    expect(projects.find((project) => project.id === "bdb")?.summary).toContain("local-first");
    expect(projects.find((project) => project.id === "distribution-desk")?.summary).toContain("official platform APIs");
    expect(projects.find((project) => project.id === "storyform")?.summary).toContain("storyboard-first");

    expect(projectVisibilityLabel("public_summary_only")).toBe("PUBLIC SUMMARY");
    expect(verificationLevelLabel("owner_verified_private")).toBe("OWNER-VERIFIED IMPLEMENTATION");
    expect(evidenceVisibilityLabel("owner_verified_private")).toBe("OWNER-VERIFIED IMPLEMENTATION");
    expect([
      projectVisibilityLabel("public_summary_only"),
      verificationLevelLabel("owner_verified_private"),
      evidenceVisibilityLabel("owner_verified_private"),
    ].join(" ")).not.toContain("_");
  });
});
