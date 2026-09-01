import { describe, expect, it } from "vitest";

import { createAgentInterface } from "../../src/application/AgentInterface";
import { buildCollaborationBrief } from "../../src/domain/buildCollaborationBrief";
import { buildMatchResult } from "../../src/domain/matchRequirements";
import { projectPresentation } from "../../src/presentation/projectPresentation";
import { createAppStore } from "../../src/state/appStore";
import { selectProjectNodeStates } from "../../src/state/selectors";
import { createStoreStatePort } from "../../src/state/storeStatePort";
import { createToolDefinitions } from "../../src/webmcp/toolDefinitions";

const crmRequirements = ["CRM", "Supabase", "Gmail", "operator workflow"] as const;
const goldenRequirements = ["Electron", "MCP", "AI automation", "Supabase"] as const;
const negativeRequirements = ["Swift", "Metal", "native iOS"] as const;
const nativeSiteControlRequirements = ["Site-control architecture"] as const;

describe("project presentation tiers", () => {
  it("curates four evidence objects, two extended signals, and one latent record without dropping a project", () => {
    // This catches Native Site Control becoming default-visible or disappearing from the semantic selector.
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
    expect(nodes.filter(({ defaultPresence }) => defaultPresence === "evidence-object")).toHaveLength(4);
    expect(nodes.filter(({ defaultPresence }) => defaultPresence === "extended-signal")).toHaveLength(2);
    expect(nodes.filter(({ defaultPresence }) => defaultPresence === "latent")).toHaveLength(1);
    expect(nodes.filter(({ visualForm }) => visualForm === "evidence-object")).toHaveLength(4);
    expect(nodes.filter(({ visualForm }) => visualForm === "extended-signal")).toHaveLength(2);
    expect(nodes.filter(({ visualForm }) => visualForm === "latent")).toHaveLength(1);
    expect(nodes.find(({ projectId }) => projectId === "sprintcrm")).toMatchObject({
      rank: null,
      presentationTier: "extended",
      defaultPresence: "extended-signal",
      visualForm: "extended-signal",
    });
    expect(nodes.find(({ projectId }) => projectId === "presence-os-memory-atlas")).toMatchObject({
      presentationTier: "extended",
      defaultPresence: "extended-signal",
      visualForm: "extended-signal",
    });
    expect(nodes.find(({ projectId }) => projectId === "native-site-control")).toMatchObject({
      rank: null,
      presentationTier: "extended",
      defaultPresence: "latent",
      visualForm: "latent",
    });
    expect(projectPresentation["native-site-control"]).toMatchObject({
      tier: "extended",
      defaultPresence: "latent",
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

  it("promotes the latent Native Site Control record only for its positive top-three match", () => {
    // This catches a positive top-three latent result remaining hidden or being promoted without evidence.
    const store = createAppStore();
    const match = buildMatchResult(nativeSiteControlRequirements);
    store.getState().apply({
      type: "match_evaluated",
      match,
      requirements: nativeSiteControlRequirements,
      provenance: "manual",
    });
    const brief = buildCollaborationBrief(
      { projectType: "Site-control foundation", requirements: nativeSiteControlRequirements },
      match,
      "manual",
    );

    expect(match).toMatchObject({ id: "match-aee2e9118ed7298c", evidenceCoverage: 1 });
    expect(match.rankedProjects[0]).toMatchObject({ projectId: "native-site-control", score: 1 });
    expect(match.rankedProjects.slice(0, 3).map(({ projectId }) => projectId)).toEqual([
      "native-site-control",
      "bdb",
      "distribution-desk",
    ]);
    expect(brief.relevantProjectIds).toEqual(["native-site-control"]);
    expect(selectProjectNodeStates(store.getState()).find(({ projectId }) => projectId === "native-site-control"))
      .toMatchObject({
        rank: 1,
        presentationTier: "extended",
        defaultPresence: "latent",
        visualForm: "evidence-object",
        spatialTier: "dominant",
        matchState: "matched",
      });
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

  it("pins the golden, negative, and tool-registration outputs outside presentation", () => {
    // This catches presentation-only metadata leaking into immutable domain or WebMCP contracts.
    const golden = buildMatchResult(goldenRequirements);
    const goldenBrief = buildCollaborationBrief(
      { projectType: "Desktop agent workspace", requirements: goldenRequirements },
      golden,
      "manual",
    );
    const negative = buildMatchResult(negativeRequirements);
    const negativeBrief = buildCollaborationBrief(
      { projectType: "Native iOS application", requirements: negativeRequirements },
      negative,
      "manual",
    );
    const definitions = createToolDefinitions(createAgentInterface(createStoreStatePort(createAppStore())));

    expect(golden).toMatchObject({ id: "match-12eeaddb6f02995c", evidenceCoverage: 1 });
    expect(golden.rankedProjects.slice(0, 3).map(({ projectId }) => projectId)).toEqual([
      "bdb",
      "weekfield",
      "distribution-desk",
    ]);
    expect(goldenBrief.relevantProjectIds).toEqual(["bdb", "weekfield", "distribution-desk"]);

    expect(negative).toMatchObject({ id: "match-dfd5f03ae5db0a3d", evidenceCoverage: 0 });
    expect(negative.requirements.map(({ label }) => label)).toEqual(["missing", "missing", "missing"]);
    expect(negative.rankedProjects).toHaveLength(7);
    expect(negative.rankedProjects.map(({ score }) => score)).toEqual([0, 0, 0, 0, 0, 0, 0]);
    expect(negativeBrief.relevantProjectIds).toEqual([]);

    expect(definitions.map(({ name }) => name)).toEqual([
      "get_profile",
      "get_capabilities",
      "list_projects",
      "get_project",
      "match_requirements",
      "focus_project",
      "create_collaboration_brief",
    ]);
  });
});
