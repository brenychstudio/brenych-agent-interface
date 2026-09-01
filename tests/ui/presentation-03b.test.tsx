import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";

afterEach(() => {
  cleanup();
  resetAppForTesting();
  vi.restoreAllMocks();
  Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
});

const openBdbInspect = (): void => {
  fireEvent.click(screen.getByRole("button", { name: "Add Electron" }));
  fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));
  fireEvent.click(screen.getByRole("button", { name: /Project BDB/ }));
};

describe("03B full-bleed presentation", () => {
  it("gives Inspect one full-paper foreground over the inert persistent field", () => {
    // This catches the project identity reverting to a generic heading or Inspect becoming a nested scroll surface beside the field.
    render(<App />);
    const field = screen.getByTestId("evidence-field");

    openBdbInspect();

    const heading = screen.getByRole("heading", { name: "BDB", level: 2 });
    const inspect = screen.getByRole("region", { name: "BDB evidence inspect" });
    const canvas = field.closest("[data-stage-canvas]");
    expect(screen.getByTestId("experience-stage")).toHaveAttribute("data-foreground", "inspect");
    expect(screen.getByTestId("foreground-paper")).toContainElement(heading);
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas).toHaveAttribute("inert");
    expect(inspect).toHaveAttribute("data-scroll-owner", "document");
    expect(inspect).not.toHaveAttribute("role");
    expect(inspect).not.toHaveAttribute("tabindex");
    expect(screen.queryByRole("heading", { name: "PROJECT BRIEF" })).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: /BDB task control center/i })).toHaveAttribute("data-fit", "contain");
    expect(screen.getByRole("img", { name: /BDB task control center/i })).toHaveAttribute("width", "1529");
    expect(screen.getByRole("img", { name: /BDB task control center/i })).toHaveAttribute("height", "976");
    expect(screen.getByRole("img", { name: /BDB task control center/i })).toHaveStyle({ aspectRatio: "1529 / 976" });
  });

  it("replaces Inspect with one document-scrolling Brief foreground", () => {
    // This catches Brief stacking with Inspect or acquiring a focusable nested scroll container.
    render(<App />);
    const field = screen.getByTestId("evidence-field");

    openBdbInspect();
    fireEvent.click(screen.getByRole("button", { name: "CREATE COLLABORATION BRIEF" }));

    const heading = screen.getByRole("heading", { name: "PROJECT BRIEF", level: 2 });
    const brief = screen.getByRole("region", { name: "PROJECT BRIEF" });
    const canvas = field.closest("[data-stage-canvas]");
    expect(screen.getByTestId("experience-stage")).toHaveAttribute("data-foreground", "brief");
    expect(screen.getByTestId("foreground-paper")).toContainElement(heading);
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas).toHaveAttribute("inert");
    expect(brief).toHaveAttribute("data-scroll-owner", "document");
    expect(brief).not.toHaveAttribute("role");
    expect(brief).not.toHaveAttribute("tabindex");
    expect(screen.queryByRole("region", { name: "BDB evidence inspect" })).not.toBeInTheDocument();
  });

  it("lets the browser reveal the newly focused Inspect heading on entry", () => {
    // This catches Inspect suppressing the browser scroll needed to reveal its h2 after opening from a scrolled Evidence Field.
    Object.defineProperty(window, "scrollY", { configurable: true, value: 420 });
    const focus = vi.spyOn(HTMLElement.prototype, "focus");
    render(<App />);

    openBdbInspect();

    const heading = screen.getByRole("heading", { name: "BDB", level: 2 });
    const headingFocusCall = focus.mock.contexts.findIndex((context) => context === heading);
    expect(headingFocusCall).toBeGreaterThanOrEqual(0);
    expect(focus.mock.calls[headingFocusCall]?.[0]).not.toEqual(expect.objectContaining({ preventScroll: true }));
  });

  it("lets the browser reveal the newly focused Brief heading on entry", () => {
    // This catches Brief suppressing the browser scroll needed to reveal its h2 after creation from a scrolled Inspect document.
    const focus = vi.spyOn(HTMLElement.prototype, "focus");
    render(<App />);
    openBdbInspect();
    focus.mockClear();
    Object.defineProperty(window, "scrollY", { configurable: true, value: 860 });

    fireEvent.click(screen.getByRole("button", { name: "CREATE COLLABORATION BRIEF" }));

    const heading = screen.getByRole("heading", { name: "PROJECT BRIEF", level: 2 });
    const headingFocusCall = focus.mock.contexts.findIndex((context) => context === heading);
    expect(headingFocusCall).toBeGreaterThanOrEqual(0);
    expect(focus.mock.calls[headingFocusCall]?.[0]).not.toEqual(expect.objectContaining({ preventScroll: true }));
  });
});
