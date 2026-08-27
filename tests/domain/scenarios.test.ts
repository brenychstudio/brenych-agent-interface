import { describe, expect, it } from "vitest";

import { buildCollaborationBrief } from "../../src/domain/buildCollaborationBrief";
import { buildMatchResult } from "../../src/domain/matchRequirements";

describe("approved evidence scenarios", () => {
  it("scenario A ranks BDB, Weekfield, and Distribution Desk as the literal top three", () => {
    // This catches an overly broad relation displacing a directly evidenced desktop project.
    const result = buildMatchResult(["Electron", "MCP", "AI automation", "Supabase"]);

    expect(result.rankedProjects.slice(0, 3).map((project) => project.projectId)).toEqual([
      "bdb",
      "weekfield",
      "distribution-desk",
    ]);
  });

  it("scenario A carries the literal top three into a collaboration brief", () => {
    // This catches relevant-project selection inheriting an inflated operator-workflow result.
    const requirements = ["Electron", "MCP", "AI automation", "Supabase"];
    const result = buildMatchResult(requirements);
    const brief = buildCollaborationBrief(
      { projectType: "Desktop agent workspace", requirements },
      result,
      "manual",
    );

    expect(brief.relevantProjectIds).toEqual([
      "bdb",
      "weekfield",
      "distribution-desk",
    ]);
  });

  it("scenario B ranks SprintCRM first for CRM communication work", () => {
    // This catches a ranking change that does not prioritize SprintCRM's direct CRM evidence.
    const result = buildMatchResult(["CRM", "Supabase", "Gmail", "operator workflow"]);

    expect(result.rankedProjects[0]?.projectId).toBe("sprintcrm");
  });

  it("scenario C ranks Presence OS Memory Atlas first for spatial web work", () => {
    // This catches an alias or spatial evidence regression that displaces the direct public case.
    const result = buildMatchResult(["WebGL", "XR", "spatial archive", "interactive interface"]);

    expect(result.rankedProjects[0]?.projectId).toBe("presence-os-memory-atlas");
  });
});
