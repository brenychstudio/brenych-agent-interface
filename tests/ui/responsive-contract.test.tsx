import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";

const shellCss = readFileSync("src/styles/shell.css", "utf8");
const evidenceFieldCss = readFileSync("src/styles/evidence-field.css", "utf8");

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
  it.each([390, 430, 768, 1024, 1366])("keeps the challenge evidence workspace functional at %ipx", (viewport) => {
    // This catches a responsive branch that hides or disconnects a core workflow control at a supported viewport.
    setViewport(viewport);
    render(<App />);

    expect(screen.getByRole("heading", { name: "WHAT ARE YOU BUILDING?" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Add a requirement" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Evidence field" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Selected studio systems" })).toBeInTheDocument();
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

  it("bounds the desktop composer headline before the evidence-stage column", () => {
    // This catches the longest headline glyph run crossing into the stage at the verified 1366px desktop viewport.
    expect(shellCss).toMatch(/\.requirement-composer h1 \{[^}]*font-size: clamp\(2\.3rem, 3\.35vw, 4\.8rem\)/);
  });

  it("releases the sticky composer before the match summary spans the tablet grid", () => {
    // A sticky first column otherwise remains painted over the full-width match panel while scrolling to Inspect.
    const tabletRule = shellCss.match(/@media \(max-width: 1150px\)[\s\S]*?(?=@media \(max-width: 620px\)|$)/)?.[0] ?? "";
    expect(tabletRule).toMatch(/\.requirement-composer \{[^}]*position: static/);
  });

  it("keeps the fixed mobile summary out of focused Inspect and Brief work", () => {
    const mobileRule = shellCss.match(/@media \(max-width: 620px\)[\s\S]*?(?=@media \(prefers-reduced-motion: reduce\)|$)/)?.[0] ?? "";
    expect(mobileRule).toMatch(/\.experience--inspect \.match-compact-summary,[\s\S]*\.experience--brief \.match-compact-summary \{ display: none; \}/);
    expect(mobileRule).toMatch(/\.experience--inspect \.match-panel,[\s\S]*\.experience--brief \.match-panel \{ display: none; \}/);
  });

  it("reserves enough desktop stage depth for the seventh project and gives dark nodes a contrasting focus ring", () => {
    expect(evidenceFieldCss).toMatch(/\.evidence-field \{[^}]*min-height: 74rem/);
    expect(evidenceFieldCss).toMatch(/\.project-node:focus-visible \{[^}]*outline: 3px solid var\(--stage-accent\);[^}]*outline-offset: 4px/);
  });

  it("reserves mobile heading depth before the first evidence card", () => {
    const mobileRule = evidenceFieldCss.match(/@media \(max-width: 620px\)[\s\S]*?(?=@media \(prefers-reduced-motion: reduce\)|$)/)?.[0] ?? "";
    expect(mobileRule).toMatch(/\.evidence-field \{[^}]*padding: 7\.5rem \.7rem 1rem/);
  });

  it("keeps the evaluated bottom row inside the 1024px desktop-edge stage", () => {
    setViewport(1024);
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Add Electron" }));
    fireEvent.click(screen.getByRole("button", { name: "Add MCP" }));
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));

    const bottomRowY = screen.getAllByRole("button", { name: /Project .*rank [4-7]/i })
      .map((node) => Number.parseFloat(node.style.getPropertyValue("--node-y")));
    expect(Math.max(...bottomRowY)).toBeLessThanOrEqual(61);
  });
});
