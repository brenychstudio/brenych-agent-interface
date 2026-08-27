import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";

afterEach(() => { cleanup(); resetAppForTesting(); });

describe("manual evidence flow", () => {
  it("evaluates the documented manual scenario with visible provenance", () => {
    // This catches a manual composer that bypasses the facade or leaves the evaluated evidence invisible.
    render(<App />);

    ["Electron", "MCP", "AI automation", "Supabase"].forEach((requirement) => {
      fireEvent.click(screen.getByRole("button", { name: `Add ${requirement}` }));
    });
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));

    expect(screen.getByText("EVIDENCE COVERAGE")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /BDB/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Distribution Desk/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Weekfield/i })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Manual action: Requirements evaluated.");
  });

  it("keeps the manual requirement draft within the 12-item boundary", () => {
    // This catches a composer that lets UI state exceed the facade's valid request bound.
    render(<App />);
    const input = screen.getByRole("textbox", { name: "Add a requirement" });

    for (let index = 1; index <= 13; index += 1) {
      fireEvent.change(input, { target: { value: `Requirement ${index}` } });
      fireEvent.click(screen.getByRole("button", { name: "Add requirement" }));
    }

    expect(screen.getAllByRole("button", { name: /Remove Requirement/ })).toHaveLength(12);
    expect(screen.getByRole("alert")).toHaveTextContent("at most 12 requirements");
  });

  it("resets pending composer text and its visible validation error", () => {
    // This catches semantic reset leaving component-local draft state visible in an otherwise cleared workspace.
    render(<App />);
    const input = screen.getByRole("textbox", { name: "Add a requirement" });

    fireEvent.change(input, { target: { value: "Pending local requirement" } });
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));
    expect(input).toHaveValue("Pending local requirement");
    expect(screen.getByRole("alert")).toHaveTextContent("Add at least one requirement");

    fireEvent.click(screen.getByRole("button", { name: "Reset workspace" }));

    expect(input).toHaveValue("");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Project BDB, field, not evaluated/i })).toBeInTheDocument();
  });
});
