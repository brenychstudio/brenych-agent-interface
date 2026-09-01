import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";
import { buildMatchResult } from "../../src/domain/matchRequirements";

const shellCss = readFileSync("src/styles/shell.css", "utf8");

afterEach(() => { cleanup(); resetAppForTesting(); });

describe("match mode", () => {
  it("keeps original requirement text and expresses fit without probability language", () => {
    // This catches a matrix that substitutes normalized IDs, hides the state labels, or presents a confidence as a probability.
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Add Electron" }));
    fireEvent.click(screen.getByRole("button", { name: "Add MCP" }));
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));

    expect(screen.getByText("EVIDENCE-BACKED FIT")).toBeInTheDocument();
    expect(screen.getAllByText("MATCHED")).not.toHaveLength(0);
    expect(screen.getByText("PARTIAL")).toBeInTheDocument();
    expect(screen.getAllByText("NOT DEMONSTRATED")).not.toHaveLength(0);
    expect(screen.getByRole("region", { name: "MATCHED" })).toHaveTextContent("Electron");
    const counts = screen.getByLabelText("Requirement coverage counts");
    expect(counts).toHaveTextContent("2 / 2 REQUIREMENTS MATCHED");
    expect(counts).toHaveTextContent("0 RELATED");
    expect(counts).toHaveTextContent("0 NOT DEMONSTRATED");
    expect(screen.getByRole("listitem", { name: "Rank 1 BDB" })).toHaveTextContent("01BDB");
    expect(screen.getByRole("listitem", { name: "Rank 1 BDB" })).toHaveTextContent("OWNER-VERIFIED IMPLEMENTATION");
    expect(screen.getByText("EVIDENCE MODEL: DETERMINISTIC")).toBeInTheDocument();
    expect(screen.queryByText(/confidence/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/probability/i)).not.toBeInTheDocument();
  });

  it("constrains real-media traces to a square instead of honoring intrinsic screenshot height", () => {
    expect(shellCss).toMatch(/\.strongest-evidence li > img,[\s\S]*?height: 3\.2rem/);
  });

  it("separates direct and related contributions in the strongest-evidence summary", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Add MCP" }));
    fireEvent.click(screen.getByRole("button", { name: "Add Supabase" }));
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));

    const weekfield = screen.getByRole("listitem", { name: /Rank 1 Weekfield|Rank 2 Weekfield/ });
    expect(weekfield).toHaveTextContent("DIRECT: Supabase");
    expect(weekfield).toHaveTextContent("RELATED: MCP");
  });

  it("states requirement coverage deterministically without probabilistic wording", () => {
    // This catches the panel reading as an AI confidence score, and catches project counts being
    // presented as if they were matched requirements.
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Add Electron" }));
    fireEvent.click(screen.getByRole("button", { name: "Add MCP" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Add a requirement" }), { target: { value: "CoreML" } });
    fireEvent.click(screen.getByRole("button", { name: "Add requirement" }));
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));

    const panel = screen.getByRole("complementary", { name: "EVIDENCE COVERAGE" });
    expect(within(panel).getByText("EVIDENCE MODEL: DETERMINISTIC")).toBeInTheDocument();
    expect(within(panel).getByLabelText("Requirement coverage counts"))
      .toHaveTextContent("2 / 3 REQUIREMENTS MATCHED");
    expect(within(panel).getByLabelText("Requirement coverage counts")).toHaveTextContent("1 NOT DEMONSTRATED");

    // No surface may imply a probability, a guarantee, or an opinion about success.
    for (const wording of [/confidence/i, /probability/i, /likelihood/i, /guarantee/i]) {
      expect(within(panel).queryByText(wording)).not.toBeInTheDocument();
    }
    // The compact summary carries the same semantics, and never a bare generic MISSING.
    const compact = panel.querySelector(".match-compact-summary");
    if (!compact) throw new Error("compact match summary is missing");
    expect(compact.textContent).toContain("2/3 REQUIREMENTS MATCHED");
    expect(compact.textContent).toContain("NOT DEMONSTRATED");
    expect(compact.textContent).not.toMatch(/\bMISSING\b/);
  });

  it("keeps the deterministic evidence confidence field in the domain and the agent surface", () => {
    // This catches presentation copy changes leaking into the frozen matcher or WebMCP output.
    const result = buildMatchResult(["Electron", "MCP", "CoreML"]);
    expect(result.evidenceConfidence).toBe("medium");
    expect(Object.keys(result)).toContain("evidenceConfidence");
  });
});
