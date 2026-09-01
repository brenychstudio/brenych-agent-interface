import { describe, expect, it } from "vitest";

import { createAgentInterface } from "../../src/application/AgentInterface";
import { buildCollaborationBrief } from "../../src/domain/buildCollaborationBrief";
import { buildMatchResult } from "../../src/domain/matchRequirements";
import { createAppStore } from "../../src/state/appStore";
import { selectProjectNodeStates } from "../../src/state/selectors";
import { createStoreStatePort } from "../../src/state/storeStatePort";
import { createToolDefinitions } from "../../src/webmcp/toolDefinitions";

const crmRequirements = ["CRM", "Supabase", "Gmail", "operator workflow"] as const;

describe("project presentation tiers", () => {
  it("curates four flagship objects and three extended signals without dropping a project", () => {
    // This catches a default scene that treats the full evidence dataset as seven equally prominent cards.
    const store = createAppStore();
    const nodes = selectProjectNodeStates(store.getState());

    const flagship = nodes.filter(({ presentationTier }) => presentationTier === "flagship").map(({ projectId }) => projectId);
    const extended = nodes.filter(({ presentationTier }) => presentationTier === "extended").map(({ projectId }) => projectId);
    expect(flagship).toHaveLength(4);
    expect(flagship).toEqual(expect.arrayContaining(["bdb", "weekfield", "distribution-desk", "storyform"]));
    expect(extended).toHaveLength(3);
    expect(extended).toEqual(expect.arrayContaining([
      "sprintcrm",
      "native-site-control",
      "presence-os-memory-atlas",
    ]));
    expect(nodes).toHaveLength(7);
    expect(nodes.filter(({ visualForm }) => visualForm === "evidence-object")).toHaveLength(4);
    expect(nodes.filter(({ visualForm }) => visualForm === "extended-signal")).toHaveLength(3);
    expect(nodes.find(({ projectId }) => projectId === "sprintcrm")).toMatchObject({
      rank: null,
      presentationTier: "extended",
      visualForm: "extended-signal",
    });
    expect(nodes.find(({ projectId }) => projectId === "bdb")).toMatchObject({
      rank: null,
      spatialTier: "field",
      transform: { z: 18, scale: 1.05, opacity: 1 },
    });
    expect(nodes.find(({ projectId }) => projectId === "distribution-desk")).toMatchObject({
      rank: null,
      spatialTier: "field",
      transform: { z: -40, scale: 0.88, opacity: 0.78 },
    });
  });

  it("promotes extended evidence into a full object when the unchanged match ranks it first", () => {
    // This catches presentation curation hiding a relevant extended project after ranking has selected it.
    const store = createAppStore();
    const match = buildMatchResult(crmRequirements);
    store.getState().apply({
      type: "match_evaluated",
      match,
      requirements: crmRequirements,
      provenance: "manual",
    });

    expect(selectProjectNodeStates(store.getState()).find(({ projectId }) => projectId === "sprintcrm"))
      .toMatchObject({ rank: 1, presentationTier: "extended", visualForm: "evidence-object" });
  });

  it("leaves matcher, brief, and WebMCP output at the frozen CRM fixture", async () => {
    // This catches presentation metadata leaking backward into scoring, brief derivation, or agent output.
    const match = buildMatchResult(crmRequirements);
    const brief = buildCollaborationBrief(
      { projectType: "CRM communication workspace", requirements: crmRequirements },
      match,
      "manual",
    );
    const state = createStoreStatePort(createAppStore());
    const definitions = createToolDefinitions(createAgentInterface(state));
    const matchTool = definitions.find(({ name }) => name === "match_requirements");
    if (!matchTool) throw new Error("match_requirements tool is missing");
    const toolResult = await matchTool.execute(
      { requirements: crmRequirements },
      { signal: new AbortController().signal },
    );

    expect(match).toMatchObject({
      id: "match-3073d8fe14f0c60e",
      evidenceCoverage: 0.975,
    });
    expect(match.rankedProjects.slice(0, 3).map(({ projectId }) => projectId)).toEqual([
      "sprintcrm",
      "weekfield",
      "bdb",
    ]);
    expect(brief.relevantProjectIds).toEqual(["sprintcrm", "weekfield"]);
    expect(toolResult).toMatchObject({
      ok: true,
      data: {
        id: "match-3073d8fe14f0c60e",
        evidenceCoverage: 0.975,
        rankedProjects: [
          { projectId: "sprintcrm", score: 0.975 },
          { projectId: "weekfield", score: 0.6125 },
          { projectId: "bdb", score: 0 },
          { projectId: "distribution-desk", score: 0 },
          { projectId: "native-site-control", score: 0 },
          { projectId: "presence-os-memory-atlas", score: 0 },
          { projectId: "storyform", score: 0 },
        ],
      },
    });
  });
});
