import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";

afterEach(() => { cleanup(); resetAppForTesting(); });

describe("semantic capability connections", () => {
  it("shows bounded requirement to capability to strongest-project traces only in Match Mode", () => {
    // This catches decorative graph lines that are disconnected from the real deterministic match.
    render(<App />);
    expect(screen.queryByRole("region", { name: "Evidence connections" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add Electron" }));
    fireEvent.click(screen.getByRole("button", { name: "Add MCP" }));
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));

    const connections = screen.getByRole("region", { name: "Evidence connections" });
    const traces = within(connections).getAllByRole("listitem");
    expect(traces).toHaveLength(2);
    expect(connections).toHaveTextContent("Electron → Electron → BDB");
    expect(connections).toHaveTextContent("MCP → MCP → BDB");
    expect(traces.every((trace) => trace.hasAttribute("data-capability-id"))).toBe(true);
    expect(traces.length).toBeLessThanOrEqual(5);

    fireEvent.click(screen.getByRole("button", { name: /Project BDB, rank 1/i }));
    expect(screen.queryByRole("region", { name: "Evidence connections" })).not.toBeInTheDocument();
  });
});
