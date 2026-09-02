import { describe, expect, it } from "vitest";

import { createAgentInterface } from "../../src/application/AgentInterface";
import { createAppStore } from "../../src/state/appStore";
import { createStoreStatePort } from "../../src/state/storeStatePort";
import { createToolDefinitions } from "../../src/webmcp/toolDefinitions";

const createTools = () => {
  const state = createStoreStatePort(createAppStore());
  return { state, tools: Object.fromEntries(createToolDefinitions(createAgentInterface(state)).map((tool) => [tool.name, tool])) };
};

/**
 * The shipping browser implementation invokes a registered tool with the input object alone, while
 * the published type definitions declare a second options argument carrying the cancellation
 * signal. A tool that can only be called the documented way registers and enumerates correctly but
 * fails on every real invocation, so both call shapes are part of the contract.
 */
const invokeAsHost = (tool: { execute: (...args: never[]) => unknown }, input: unknown): unknown =>
  (tool.execute as unknown as (value: unknown) => unknown)(input);

describe("WebMCP host invocation", () => {
  it("executes every registered tool when the host supplies no execution options", async () => {
    // This catches the tool wrapper depending on an options argument the browser does not pass.
    const { tools } = createTools();

    await expect(invokeAsHost(tools.get_profile, {})).resolves.toEqual(expect.objectContaining({ ok: true }));
    await expect(invokeAsHost(tools.get_capabilities, {})).resolves.toEqual(expect.objectContaining({ ok: true }));
    await expect(invokeAsHost(tools.list_projects, {})).resolves.toEqual(expect.objectContaining({ ok: true }));
    await expect(invokeAsHost(tools.get_project, { projectId: "bdb" })).resolves.toEqual(expect.objectContaining({ ok: true }));
  });

  it("applies visible semantic effects when the host supplies no execution options", async () => {
    // This catches an agent-driven match or focus silently failing in a real WebMCP host.
    const { state, tools } = createTools();

    await expect(invokeAsHost(tools.match_requirements, { requirements: ["Electron", "MCP", "AI automation", "Supabase"] }))
      .resolves.toEqual(expect.objectContaining({ ok: true, data: expect.objectContaining({ evidenceCoverage: 1, missing: [] }) }));
    await expect(invokeAsHost(tools.focus_project, { projectId: "bdb" }))
      .resolves.toEqual(expect.objectContaining({ ok: true, data: expect.objectContaining({ id: "bdb" }) }));

    expect(state.snapshot().activeMode).toBe("inspect");
    expect(state.snapshot().currentAgentAction?.source).toBe("webmcp");
  });

  it("still honours a cancellation signal when the host supplies one", async () => {
    // This catches the compatibility path discarding cancellation for hosts that do pass options.
    const { state, tools } = createTools();
    const aborted = AbortSignal.abort();

    await expect(tools.match_requirements.execute({ requirements: ["Electron"] }, { signal: aborted }))
      .resolves.toEqual(expect.objectContaining({ ok: false, error: expect.objectContaining({ code: "CANCELLED" }) }));
    expect(state.getEvents()).toEqual([]);
  });

  it("rejects invalid input identically on both call shapes", async () => {
    // This catches the compatibility path weakening the closed JSON-schema contract.
    const { state, tools } = createTools();

    await expect(invokeAsHost(tools.match_requirements, { requirements: ["Electron"], extra: "no" }))
      .resolves.toEqual(expect.objectContaining({ ok: false, error: expect.objectContaining({ code: "INVALID_INPUT" }) }));
    await expect(invokeAsHost(tools.get_project, { projectId: "not-a-project" }))
      .resolves.toEqual(expect.objectContaining({ ok: false, error: expect.objectContaining({ code: "INVALID_INPUT" }) }));
    expect(state.getEvents()).toEqual([]);
  });
});
