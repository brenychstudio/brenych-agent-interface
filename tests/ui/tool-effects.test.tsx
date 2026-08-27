import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";
import { agentInterface } from "../../src/app/runtime";
import { useAppStore } from "../../src/state/appStore";
import { selectFocusedProjectContext } from "../../src/state/selectors";
import { ToolLifecycle } from "../../src/webmcp/toolLifecycle";
import { createToolDefinitions } from "../../src/webmcp/toolDefinitions";
import { FakeWebMcpPort } from "../webmcp/fakeWebMcpPort";

const setupControlledApp = async () => {
  render(<App />);
  const port = new FakeWebMcpPort();
  const lifecycle = new ToolLifecycle(port, agentInterface, () => createToolDefinitions(agentInterface));
  await lifecycle.start();
  const tools = Object.fromEntries(port.registrations.map(({ definition }) => [definition.name, definition]));
  return { lifecycle, port, tools };
};

afterEach(() => { cleanup(); resetAppForTesting(); });

describe("WebMCP visible tool effects", () => {
  it("runs all seven real definitions once and makes a WebMCP match visibly equal the manual facade result", async () => {
    // This catches a registered tool set that diverges from the app singleton or a WebMCP match that bypasses its visible semantic state.
    const requirements = ["Electron", "MCP", "AI automation", "Supabase"];
    const manualResult = agentInterface.matchRequirements({ requirements }, "manual");
    agentInterface.reset("manual");
    const { lifecycle, port, tools } = await setupControlledApp();

    expect(port.registrations.map(({ definition }) => definition.name)).toEqual([
      "get_profile",
      "get_capabilities",
      "list_projects",
      "get_project",
      "match_requirements",
      "focus_project",
      "create_collaboration_brief",
    ]);
    expect(Object.keys(tools)).toHaveLength(7);

    const result = await tools.match_requirements.execute({ requirements }, { signal: new AbortController().signal });

    expect(result).toEqual(expect.objectContaining({ ok: true, data: expect.objectContaining({ id: manualResult.id }) }));
    expect(screen.getByText(manualResult.labels.coverage)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Project BDB.*foreground.*matched/i })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("WebMCP action: Requirements evaluated.");

    await lifecycle.stop();
  });

  it("opens the same inspect evidence through focus_project and keeps WebMCP provenance visible", async () => {
    // This catches focus_project opening a transport-only result instead of the persistent inspect surface.
    const requirements = ["Electron", "MCP"];
    agentInterface.matchRequirements({ requirements }, "manual");
    agentInterface.focusProject({ projectId: "bdb" }, "manual");
    const expectedFocus = selectFocusedProjectContext(useAppStore.getState());
    const expectedDossier = agentInterface.getProject("bdb");
    agentInterface.close("manual");
    resetAppForTesting();
    const { lifecycle, tools } = await setupControlledApp();

    await tools.match_requirements.execute({ requirements }, { signal: new AbortController().signal });
    const result = await tools.focus_project.execute({ projectId: "bdb" }, { signal: new AbortController().signal });

    expect(result).toEqual(expect.objectContaining({ ok: true, data: expect.objectContaining({ id: expectedDossier.id, title: expectedDossier.title }) }));
    expect(screen.getByRole("heading", { name: "SELECTED EVIDENCE" })).toBeInTheDocument();
    expect(screen.getByText(expectedDossier.title, { selector: ".inspect-project" })).toBeInTheDocument();
    expect(screen.getByText(expectedFocus?.reason ?? "")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("WebMCP action: Project selected.");

    await lifecycle.stop();
  });

  it("creates the same editable local brief through the registered tool", async () => {
    // This catches create_collaboration_brief producing a hidden transport payload rather than the local editable draft.
    const input = {
      projectType: "Desktop agent interface",
      requirements: ["Electron", "MCP", "AI automation", "Supabase"],
      context: "A bounded local collaboration scope.",
      timeline: "Q4 discovery",
      budget: "Defined after evidence review",
    };
    const manualBrief = agentInterface.createCollaborationBrief(input, "manual");
    resetAppForTesting();
    const { lifecycle, tools } = await setupControlledApp();

    const result = await tools.create_collaboration_brief.execute(input, { signal: new AbortController().signal });

    expect(result).toEqual(expect.objectContaining({ ok: true, data: expect.objectContaining({ sourceMatchId: manualBrief.sourceMatchId, relevantProjectIds: manualBrief.relevantProjectIds, knownGaps: manualBrief.knownGaps }) }));
    expect(screen.getByRole("heading", { name: "PROJECT BRIEF" })).toBeInTheDocument();
    expect(screen.getByText(`SOURCE MATCH: ${manualBrief.sourceMatchId}`)).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "RELEVANT EVIDENCE PROJECTS" })).toHaveTextContent("BDB");
    expect(screen.getByText("KNOWN GAPS")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("WebMCP action: Collaboration brief created locally.");

    const context = screen.getByRole("textbox", { name: "Context" });
    fireEvent.change(context, { target: { value: "A human-reviewed local draft." } });
    fireEvent.blur(context);
    expect(context).toHaveValue("A human-reviewed local draft.");

    await lifecycle.stop();
  });
});
