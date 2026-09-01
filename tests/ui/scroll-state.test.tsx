import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";
import { agentInterface } from "../../src/app/runtime";
import { useAppStore } from "../../src/state/appStore";
import { ToolLifecycle } from "../../src/webmcp/toolLifecycle";
import { createToolDefinitions } from "../../src/webmcp/toolDefinitions";
import { FakeWebMcpPort } from "../webmcp/fakeWebMcpPort";

const setScroll = (left: number, top: number): void => {
  Object.defineProperty(window, "scrollX", { configurable: true, value: left });
  Object.defineProperty(window, "scrollY", { configurable: true, value: top });
};

let scrollTo: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  setScroll(0, 0);
});

afterEach(() => {
  cleanup();
  resetAppForTesting();
  setScroll(0, 0);
  vi.restoreAllMocks();
});

const CANONICAL_TOP = { left: 0, top: 0, behavior: "instant" };

describe("canonical foreground scroll state", () => {
  it("opens a project at canonical top and returns to the exact evidence position", () => {
    // This catches Inspect inheriting the workspace scroll, which pushes the studio header and the
    // project heading above the viewport, and catches a return that loses the horizontal position.
    setScroll(17, 1200);
    render(<App />);
    const origin = screen.getByRole("button", { name: /Project Weekfield/ });

    fireEvent.click(origin);

    expect(scrollTo).toHaveBeenCalledWith(CANONICAL_TOP);
    expect(screen.getByRole("heading", { name: "Weekfield", level: 2 })).toHaveFocus();

    scrollTo.mockClear();
    setScroll(0, 640);
    fireEvent.click(screen.getByRole("button", { name: "BACK TO EVIDENCE" }));

    expect(scrollTo).toHaveBeenCalledWith({ left: 17, top: 1200, behavior: "instant" });
    expect(origin).toHaveFocus();
  });

  it("restores the exact evidence-index origin and page position after a latent record", () => {
    // This catches the index losing its own origin button and the page returning to the wrong place.
    setScroll(0, 900);
    render(<App />);
    fireEvent.click(screen.getByText("FULL EVIDENCE INDEX"));
    const origin = screen.getByRole("button", { name: "Open Native Site Control evidence record" });

    fireEvent.click(origin);

    expect(scrollTo).toHaveBeenCalledWith(CANONICAL_TOP);
    expect(screen.getByRole("heading", { name: "Native Site Control", level: 2 })).toHaveFocus();

    scrollTo.mockClear();
    fireEvent.keyDown(document, { key: "Escape" });

    expect(scrollTo).toHaveBeenCalledWith({ left: 0, top: 900, behavior: "instant" });
    expect(origin).toHaveFocus();
  });

  it("gives Inspect and Brief their own canonical top while one evidence origin survives the round trip", () => {
    // This catches Brief inheriting a deep Inspect position, and catches the original evidence
    // position being overwritten while moving between the two foreground surfaces.
    setScroll(0, 1080);
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Add Electron" }));
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));
    const origin = screen.getByRole("button", { name: /Project BDB/ });

    fireEvent.click(origin);
    expect(scrollTo).toHaveBeenLastCalledWith(CANONICAL_TOP);

    setScroll(0, 1560);
    scrollTo.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "CREATE COLLABORATION BRIEF" }));

    expect(scrollTo).toHaveBeenCalledWith(CANONICAL_TOP);
    expect(scrollTo).not.toHaveBeenCalledWith(expect.objectContaining({ top: 1080 }));
    expect(screen.getByRole("heading", { name: "PROJECT BRIEF", level: 2 })).toHaveFocus();

    setScroll(0, 980);
    scrollTo.mockClear();
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.getByRole("region", { name: "BDB evidence inspect" })).toBeInTheDocument();
    expect(scrollTo).toHaveBeenCalledWith(CANONICAL_TOP);
    expect(scrollTo).not.toHaveBeenCalledWith(expect.objectContaining({ top: 1080 }));

    setScroll(0, 1240);
    scrollTo.mockClear();
    fireEvent.keyDown(document, { key: "Escape" });

    expect(scrollTo).toHaveBeenCalledWith({ left: 0, top: 1080, behavior: "instant" });
    expect(origin).toHaveFocus();
  });

  it("does not let a second project inherit the previous foreground position", () => {
    // This catches saved-position state leaking from one inspected project into the next one.
    setScroll(0, 800);
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Project BDB/ }));
    setScroll(0, 1500);
    fireEvent.click(screen.getByRole("button", { name: "BACK TO EVIDENCE" }));

    setScroll(0, 800);
    scrollTo.mockClear();
    fireEvent.click(screen.getByRole("button", { name: /Project StoryForm/ }));

    expect(scrollTo).toHaveBeenCalledWith(CANONICAL_TOP);
    expect(screen.getByRole("heading", { name: "StoryForm", level: 2 })).toHaveFocus();
  });
});

describe("agent-driven canonical scroll state", () => {
  const startAgentTools = async () => {
    const port = new FakeWebMcpPort();
    const lifecycle = new ToolLifecycle(port, agentInterface, () => createToolDefinitions(agentInterface));
    await lifecycle.start();
    const tools = Object.fromEntries(port.registrations.map(({ definition }) => [definition.name, definition]));
    return { lifecycle, tools };
  };

  /**
   * jsdom has no layout, so it never clamps a scroll position. A real browser does: opening a
   * project collapses the document to the foreground surface and the scroll position is clamped
   * during that commit, before React runs any layout effect. This subscriber reproduces that clamp
   * at the same point in the sequence, so the capture has to happen on the store transition itself.
   */
  const simulateBrowserScrollClamp = (): (() => void) =>
    useAppStore.subscribe((next, previous) => {
      const entered = (next.activeMode === "inspect" || next.activeMode === "brief")
        && previous.activeMode !== "inspect" && previous.activeMode !== "brief";
      if (entered) setScroll(0, 0);
    });

  it("captures the evidence origin for a WebMCP focus_project that never touches a control", async () => {
    // An agent transition has no DOM click to hang the capture on, so a capture that waits for the
    // layout effect reads the already-clamped position and the workspace returns to the wrong place.
    setScroll(13, 1200);
    render(<App />);
    const { lifecycle, tools } = await startAgentTools();
    const unclamp = simulateBrowserScrollClamp();

    await act(async () => {
      await tools.focus_project.execute({ projectId: "weekfield" }, { signal: new AbortController().signal });
    });

    expect(screen.getByRole("region", { name: "Weekfield evidence inspect" })).toBeInTheDocument();
    expect(scrollTo).toHaveBeenCalledWith(CANONICAL_TOP);
    expect(screen.getByLabelText("Shared surface control provenance")).toHaveTextContent("WEBMCP ACTION");

    scrollTo.mockClear();
    fireEvent.keyDown(document, { key: "Escape" });

    expect(scrollTo).toHaveBeenCalledWith({ left: 13, top: 1200, behavior: "instant" });
    unclamp();
    await lifecycle.stop();
  });

  it("falls back to a stable project control when an agent transition left no DOM origin", () => {
    // This catches the return from an agent-opened inspection leaving focus stranded on the body.
    setScroll(0, 740);
    render(<App />);
    const unclamp = simulateBrowserScrollClamp();

    act(() => { agentInterface.focusProject({ projectId: "bdb" }, "webmcp"); });

    expect(screen.getByRole("region", { name: "BDB evidence inspect" })).toBeInTheDocument();
    expect(scrollTo).toHaveBeenCalledWith(CANONICAL_TOP);

    scrollTo.mockClear();
    fireEvent.keyDown(document, { key: "Escape" });

    expect(scrollTo).toHaveBeenCalledWith({ left: 0, top: 740, behavior: "instant" });
    expect(document.activeElement).toHaveAttribute("data-project-id", "bdb");
    unclamp();
  });

  it("keeps a manual origin capture authoritative when the store transition follows", () => {
    // This catches the agent-side capture overwriting the exact position a click already recorded.
    setScroll(21, 960);
    render(<App />);
    const unclamp = simulateBrowserScrollClamp();
    const origin = screen.getByRole("button", { name: /Project StoryForm/ });

    fireEvent.click(origin);

    expect(scrollTo).toHaveBeenCalledWith(CANONICAL_TOP);
    scrollTo.mockClear();
    fireEvent.keyDown(document, { key: "Escape" });

    expect(scrollTo).toHaveBeenCalledWith({ left: 21, top: 960, behavior: "instant" });
    expect(origin).toHaveFocus();
    unclamp();
  });
});
