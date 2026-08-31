import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";

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
    expect(counts).toHaveTextContent("2 MATCHED");
    expect(counts).toHaveTextContent("0 RELATED");
    expect(counts).toHaveTextContent("0 NOT DEMONSTRATED");
    expect(screen.getByRole("listitem", { name: "Rank 1 BDB" })).toHaveTextContent("01BDB");
    expect(screen.getByRole("listitem", { name: "Rank 1 BDB" })).toHaveTextContent("OWNER-VERIFIED IMPLEMENTATION");
    expect(screen.getByText(/confidence: high/i)).toBeInTheDocument();
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
});
