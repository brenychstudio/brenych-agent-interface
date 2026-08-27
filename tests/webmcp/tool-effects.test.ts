import { describe, expect, it } from "vitest";

import { createAgentInterface } from "../../src/application/AgentInterface";
import { createAppStore } from "../../src/state/appStore";
import { createStoreStatePort } from "../../src/state/storeStatePort";
import { createToolDefinitions } from "../../src/webmcp/toolDefinitions";

const createTools = () => {
  const state = createStoreStatePort(createAppStore());
  return { state, tools: Object.fromEntries(createToolDefinitions(createAgentInterface(state)).map((tool) => [tool.name, tool])) };
};

const activeSignal = new AbortController().signal;

describe("WebMCP tool effects", () => {
  it("returns compact public data for a query without writing semantic state", async () => {
    // This catches query tools leaking full fixtures or treating reads as application actions.
    const { state, tools } = createTools();

    await expect(tools.get_profile.execute({}, { signal: activeSignal })).resolves.toEqual(expect.objectContaining({ ok: true, data: expect.objectContaining({ studio: "Brenych Studio" }) }));
    expect(state.getEvents()).toEqual([]);
  });

  it("rejects unknown input fields without a state write", async () => {
    // This catches bypassing the closed JSON-schema contract when a caller invokes a handler directly.
    const { state, tools } = createTools();

    await expect(tools.match_requirements.execute({ requirements: ["Electron"], extra: "no" }, { signal: activeSignal })).resolves.toEqual(expect.objectContaining({ ok: false, error: expect.objectContaining({ code: "INVALID_INPUT" }) }));
    expect(state.getEvents()).toEqual([]);
  });

  it("rejects blank normalized requirements and blank project types before a facade write", async () => {
    // This catches transport validation accepting values that the domain regards as empty evidence requests.
    const blankRequirements = createTools();
    const punctuationRequirements = createTools();
    const blankProjectType = createTools();

    await expect(blankRequirements.tools.match_requirements.execute({ requirements: ["   "] }, { signal: activeSignal })).resolves.toEqual(expect.objectContaining({ ok: false, error: expect.objectContaining({ code: "INVALID_INPUT" }) }));
    await expect(punctuationRequirements.tools.match_requirements.execute({ requirements: ["..."] }, { signal: activeSignal })).resolves.toEqual(expect.objectContaining({ ok: false, error: expect.objectContaining({ code: "INVALID_INPUT" }) }));
    await expect(blankProjectType.tools.create_collaboration_brief.execute({ projectType: "\t", requirements: ["日本語"] }, { signal: activeSignal })).resolves.toEqual(expect.objectContaining({ ok: false, error: expect.objectContaining({ code: "INVALID_INPUT" }) }));
    expect(blankRequirements.state.getEvents()).toEqual([]);
    expect(punctuationRequirements.state.getEvents()).toEqual([]);
    expect(blankProjectType.state.getEvents()).toEqual([]);
  });

  it("checks cancellation before committing a match", async () => {
    // This catches a cancelled execution creating a late local match action.
    const { state, tools } = createTools();
    const controller = new AbortController();
    controller.abort();

    await expect(tools.match_requirements.execute({ requirements: ["Electron"] }, { signal: controller.signal })).resolves.toEqual({ ok: false, error: { code: "CANCELLED", message: "Tool execution was cancelled" } });
    expect(state.getEvents()).toEqual([]);
  });

  it("writes local state through facade commands and never echoes the full brief context", async () => {
    // This catches a transport bypassing the facade or returning the editable draft body to the caller.
    const { state, tools } = createTools();
    const context = "A private-looking but locally authored context that should remain in the editable workspace.";

    await expect(tools.focus_project.execute({ projectId: "weekfield" }, { signal: activeSignal })).resolves.toEqual(expect.objectContaining({ ok: true, data: expect.objectContaining({ id: "weekfield" }) }));
    await expect(tools.create_collaboration_brief.execute({ projectType: "Creator workspace", requirements: ["Supabase"], context }, { signal: activeSignal })).resolves.toEqual(expect.objectContaining({ ok: true, data: expect.not.objectContaining({ context, requirements: ["Supabase"] }) }));
    expect(state.snapshot()).toMatchObject({ activeMode: "brief", collaborationDraft: expect.objectContaining({ context }) });
  });
});
