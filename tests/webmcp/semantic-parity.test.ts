import { describe, expect, it } from "vitest";

import { createAgentInterface } from "../../src/application/AgentInterface";
import type { AppSemanticState } from "../../src/application/StatePort";
import { createAppStore } from "../../src/state/appStore";
import { createStoreStatePort } from "../../src/state/storeStatePort";
import { createToolDefinitions } from "../../src/webmcp/toolDefinitions";

const activeSignal = new AbortController().signal;

const createApp = () => {
  const state = createStoreStatePort(createAppStore());
  const app = createAgentInterface(state);
  return { app, state, tools: Object.fromEntries(createToolDefinitions(app).map((tool) => [tool.name, tool])) };
};

const withoutTransportProvenance = (state: AppSemanticState) => {
  return {
    ...state,
    currentAgentAction: null,
    collaborationDraft: state.collaborationDraft
      ? { ...state.collaborationDraft, provenance: "manual" as const }
      : null,
  };
};

describe("WebMCP semantic parity", () => {
  it("matches the manual requirement-evaluation state apart from action provenance", async () => {
    // This catches the tool serializing a match without committing the same semantic workspace state as the manual command.
    const manual = createApp();
    const webmcp = createApp();
    const input = { requirements: ["Electron", "MCP"] };

    manual.app.matchRequirements(input, "manual");
    await expect(webmcp.tools.match_requirements.execute(input, { signal: activeSignal })).resolves.toMatchObject({ ok: true });

    expect(withoutTransportProvenance(webmcp.state.snapshot())).toEqual(withoutTransportProvenance(manual.state.snapshot()));
  });

  it("matches the manual project-focus state apart from action provenance", async () => {
    // This catches focus_project returning a dossier while failing to make the same project active in the workspace.
    const manual = createApp();
    const webmcp = createApp();
    const input = { projectId: "weekfield" as const };

    manual.app.focusProject(input, "manual");
    await expect(webmcp.tools.focus_project.execute(input, { signal: activeSignal })).resolves.toMatchObject({ ok: true });

    expect(withoutTransportProvenance(webmcp.state.snapshot())).toEqual(withoutTransportProvenance(manual.state.snapshot()));
  });

  it("matches the manual collaboration-brief state apart from action provenance", async () => {
    // This catches create_collaboration_brief omitting semantic state that the manual command commits, such as the evaluated match or focused evidence.
    const manual = createApp();
    const webmcp = createApp();
    const input = {
      projectType: "Desktop agent interface",
      requirements: ["Electron", "MCP", "AI automation"],
      context: "A bounded local collaboration scope.",
      timeline: "Q4 discovery",
      budget: "Evidence-led planning",
    };

    manual.app.createCollaborationBrief(input, "manual");
    await expect(webmcp.tools.create_collaboration_brief.execute(input, { signal: activeSignal })).resolves.toMatchObject({ ok: true });

    expect(withoutTransportProvenance(webmcp.state.snapshot())).toEqual(withoutTransportProvenance(manual.state.snapshot()));
  });
});
