import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";

const inspectCss = readFileSync("src/styles/inspect.css", "utf8");
const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
const scrollIntoView = vi.fn();

beforeEach(() => {
  scrollIntoView.mockClear();
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: scrollIntoView });
});

afterEach(() => {
  cleanup();
  resetAppForTesting();
  if (originalScrollIntoView) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: originalScrollIntoView });
  else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
});

describe("project evidence inspect", () => {
  it("keeps the matched field mounted and exposes BDB's derived public evidence", () => {
    // This catches an inspect route/rebuild or a surface that invents a selection reason instead of using the match.
    render(<App />);
    const field = screen.getByTestId("evidence-field");

    fireEvent.click(screen.getByRole("button", { name: "Add Electron" }));
    fireEvent.click(screen.getByRole("button", { name: "Add MCP" }));
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));
    fireEvent.click(screen.getByRole("button", { name: /Project BDB/ }));

    const selectedNode = screen.getByRole("button", { name: /Project BDB/ });
    const peerNode = screen.getByRole("button", { name: /Project Distribution Desk/ });
    expect(screen.getByRole("heading", { name: "SELECTED EVIDENCE" }).closest("section")).toHaveAttribute("data-surface", "integrated-shell");
    expect(selectedNode).toHaveClass("is-inspect-selected");
    expect(selectedNode).toHaveTextContent("INSPECT SELECTED");
    expect(peerNode).toHaveClass("is-inspect-receded");
    expect(peerNode).toHaveTextContent("INSPECT BACKGROUND");
    expect(screen.getByRole("heading", { name: "SELECTED EVIDENCE" })).toHaveFocus();
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "start" });
    expect(within(screen.getByRole("region", { name: "BDB evidence media" })).getAllByText(/USER-APPROVED VISUAL EVIDENCE/)).toHaveLength(2);
    expect(screen.getByText("WHAT THIS PROJECT IS")).toBeInTheDocument();
    expect(screen.getByText("WHY IT WAS SELECTED")).toBeInTheDocument();
    expect(screen.getByText("Selected BDB; evidence directly supports electron, mcp.")).toBeInTheDocument();
    expect(screen.getByText("VERIFICATION").parentElement).toHaveTextContent("OWNER-VERIFIED IMPLEMENTATION");
    expect(screen.getByRole("region", { name: "MATCHED REQUIREMENTS" })).toHaveTextContent("Electron");
    expect(screen.getByRole("region", { name: "VERIFIED HIGHLIGHTS" })).toHaveTextContent("Local-first development control plane");
    expect(screen.getByText("Public-safe summary identifies an Electron desktop interface.")).toBeInTheDocument();
    expect(screen.getAllByText(/EVIDENCE VISIBILITY:/)).not.toHaveLength(0);
    expect(screen.getByText("Only the public-safe summary is represented.")).toBeInTheDocument();
    expect(screen.getByText("PUBLIC / PRIVATE BOUNDARY")).toBeInTheDocument();
    expect(screen.getByText("PUBLIC SUMMARY", { selector: ".boundary-label" })).toBeInTheDocument();
    expect(screen.queryByText(/owner_verified_private|public_summary_only/)).not.toBeInTheDocument();
    const media = screen.getByRole("region", { name: "BDB evidence media" });
    expect(within(media).getAllByRole("img")).toHaveLength(2);
    expect(within(media).getAllByRole("img")[0]).toHaveAttribute("loading", "eager");
    expect(within(media).getAllByRole("img")[1]).toHaveAttribute("loading", "lazy");
    expect(screen.getByTestId("evidence-field")).toBe(field);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("heading", { name: "SELECTED EVIDENCE" })).not.toBeInTheDocument();
    expect(screen.getByText("EVIDENCE COVERAGE")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Project BDB/ })).toHaveFocus();
  });

  it("labels one-hop related evidence separately from direct matches", () => {
    // This catches a 0.45 relation being presented as if the project directly demonstrated the requirement.
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Add MCP" }));
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));
    fireEvent.click(screen.getByRole("button", { name: /Project Weekfield/ }));

    expect(screen.getByText("Selected Weekfield; evidence is related to mcp.")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "MATCHED REQUIREMENTS" })).not.toHaveTextContent("MCP");
    expect(screen.getByRole("region", { name: "PARTIAL / RELATED EVIDENCE" })).toHaveTextContent("MCP");
  });

  it("bounds the cinematic title before its primary media plane", () => {
    expect(inspectCss).toMatch(/\.inspect-surface h2 \{[^}]*font-size: clamp\(3rem, 5\.2vw, 6\.5rem\)/);
  });

  it("authors a single predictable focus ring for programmatically focused surface headings", () => {
    expect(inspectCss).toMatch(/\.inspect-surface h2:focus-visible,[\s\S]*\.brief-surface h2:focus-visible \{[^}]*outline: 2px solid var\(--ink\);[^}]*outline-offset: \.35rem/);
  });

  it("leaves a visible stage-memory band above the integrated Inspect surface", () => {
    expect(inspectCss).toMatch(/\.inspect-surface \{[^}]*scroll-margin-top: clamp\(11rem, 32vh, 18rem\)/);
  });
});
