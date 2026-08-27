import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";

afterEach(() => { cleanup(); resetAppForTesting(); });

describe("match mode", () => {
  it("keeps original requirement text and expresses fit without probability language", () => {
    // This catches a matrix that substitutes normalized IDs, hides the state labels, or presents a confidence as a probability.
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Add Electron" }));
    fireEvent.click(screen.getByRole("button", { name: "Add MCP" }));
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));

    expect(screen.getByText("EVIDENCE-BACKED FIT")).toBeInTheDocument();
    expect(screen.getByText("MATCHED")).toBeInTheDocument();
    expect(screen.getByText("PARTIAL")).toBeInTheDocument();
    expect(screen.getByText("NOT DEMONSTRATED")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "MATCHED" })).toHaveTextContent("Electron");
    expect(screen.getByText(/confidence: high/i)).toBeInTheDocument();
    expect(screen.queryByText(/probability/i)).not.toBeInTheDocument();
  });
});
