import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";

const shellCss = readFileSync("src/styles/shell.css", "utf8");

const setViewport = (width: number): void => {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  window.dispatchEvent(new Event("resize"));
};

afterEach(() => {
  cleanup();
  resetAppForTesting();
  setViewport(1024);
});

describe("responsive structural contracts", () => {
  it.each([390, 768, 1366])("keeps the P0 evidence workspace functional at %ipx", (viewport) => {
    // This catches a responsive branch that hides or disconnects a core workflow control at a supported viewport.
    setViewport(viewport);
    render(<App />);

    expect(screen.getByRole("heading", { name: "WHAT ARE YOU BUILDING?" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Add a requirement" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Evidence field" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset workspace" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add Electron" }));
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));

    const bdb = screen.getByRole("button", { name: /Project BDB, rank 1, foreground, matched/i });
    expect(screen.getByText("EVIDENCE COVERAGE")).toBeInTheDocument();
    expect(bdb).toHaveAccessibleName(/Project BDB, rank 1, foreground, matched/i);

    bdb.focus();
    fireEvent.keyDown(bdb, { key: "Enter" });
    expect(screen.getByRole("heading", { name: "SELECTED EVIDENCE" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "BACK TO EVIDENCE" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "CREATE COLLABORATION BRIEF" }));
    expect(screen.getByRole("heading", { name: "PROJECT BRIEF" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Context" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "COPY BRIEF" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reset workspace" }));
    expect(screen.queryByRole("heading", { name: "PROJECT BRIEF" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Project BDB, field, not evaluated/i })).toBeInTheDocument();
  });

  it("ships a reduced-motion CSS path while leaving the structural contract to browser QA", () => {
    // This catches the reduced-motion override being removed while transitions remain in the authored field styles.
    expect(shellCss).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
    expect(shellCss).toMatch(/transition-duration: \.01ms !important/);
  });
});
