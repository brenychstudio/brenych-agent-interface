import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";

afterEach(() => { cleanup(); resetAppForTesting(); });

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
    expect(screen.getByText("WHY SELECTED")).toBeInTheDocument();
    expect(screen.getByText("Selected BDB; evidence directly supports electron, mcp.")).toBeInTheDocument();
    expect(screen.getByText("VERIFICATION").parentElement).toHaveTextContent("owner verified private");
    expect(screen.getByRole("region", { name: "MATCHED REQUIREMENTS" })).toHaveTextContent("Electron");
    expect(screen.getByText("Public-safe summary identifies an Electron desktop interface.")).toBeInTheDocument();
    expect(screen.getAllByText(/EVIDENCE VISIBILITY:/)).not.toHaveLength(0);
    expect(screen.getByText("Only the public-safe summary is represented.")).toBeInTheDocument();
    expect(screen.getByText("PUBLIC BOUNDARY: public summary only")).toBeInTheDocument();
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
});
