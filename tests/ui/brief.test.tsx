import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";

afterEach(() => { cleanup(); resetAppForTesting(); vi.restoreAllMocks(); });

describe("collaboration brief", () => {
  it("creates an editable local brief tied to its source match and reports a real copy outcome", async () => {
    // This catches a brief that loses its match provenance, writes directly to UI state, or claims clipboard success without an outcome.
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<App />);

    ["Electron", "MCP", "AI automation", "Supabase"].forEach((requirement) => {
      fireEvent.click(screen.getByRole("button", { name: `Add ${requirement}` }));
    });
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));
    fireEvent.click(screen.getByRole("button", { name: /Project BDB/ }));
    fireEvent.click(screen.getByRole("button", { name: "CREATE COLLABORATION BRIEF" }));

    expect(screen.getByRole("heading", { name: "PROJECT BRIEF" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Project type" })).toHaveValue("Desktop agent interface");
    expect(screen.getByRole("textbox", { name: "Requirements" })).toHaveValue("Electron\nMCP\nAI automation\nSupabase");
    expect(screen.getByRole("textbox", { name: "Context" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Timeline" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Budget" })).toBeInTheDocument();
    expect(screen.getByText("RELEVANT EVIDENCE PROJECTS")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "RELEVANT EVIDENCE PROJECTS" })).getByText("BDB")).toBeInTheDocument();
    expect(screen.getByText("KNOWN GAPS")).toBeInTheDocument();
    expect(screen.getByText(/SOURCE MATCH: match-/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "SUBMIT BRIEF" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "SEND BRIEF" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "BOOK CONSULTATION" })).not.toBeInTheDocument();

    const context = screen.getByRole("textbox", { name: "Context" });
    fireEvent.change(context, { target: { value: "A reviewed local collaboration scope." } });
    fireEvent.blur(context);
    expect(context).toHaveValue("A reviewed local collaboration scope.");

    fireEvent.click(screen.getByRole("button", { name: "COPY BRIEF" }));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("A reviewed local collaboration scope."));
    expect(await screen.findByText("Brief copied to clipboard.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "BACK TO EVIDENCE" }));
    expect(screen.getByRole("heading", { name: "SELECTED EVIDENCE" })).toBeInTheDocument();
  });

  it("rejects an over-limit requirements edit without silently changing the source match", () => {
    // This catches UI parsing that drops excess/empty requirements or applies an invalid draft state.
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Add Electron" }));
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));
    fireEvent.click(screen.getByRole("button", { name: /Project BDB/ }));
    fireEvent.click(screen.getByRole("button", { name: "CREATE COLLABORATION BRIEF" }));

    const sourceMatch = screen.getByText(/SOURCE MATCH: match-/).textContent;
    const requirements = screen.getByRole("textbox", { name: "Requirements" });
    const thirteenRequirements = Array.from({ length: 13 }, (_, index) => `Requirement ${index + 1}`).join("\n");
    fireEvent.change(requirements, { target: { value: thirteenRequirements } });
    fireEvent.blur(requirements);

    expect(screen.getByText(/One requirement per line; 1-12 requirements, each 1-80 characters\./)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("requirements must contain between 1 and 12 requirements");
    expect(screen.getByText(/SOURCE MATCH: match-/).textContent).toBe(sourceMatch);
    expect(requirements).toHaveValue(thirteenRequirements);
  });

  it("bounds the serialized requirements buffer before it enters local draft state", () => {
    // This catches an arbitrarily large paste being retained in React state before line validation runs.
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Add Electron" }));
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));
    fireEvent.click(screen.getByRole("button", { name: /Project BDB/ }));
    fireEvent.click(screen.getByRole("button", { name: "CREATE COLLABORATION BRIEF" }));

    const requirements = screen.getByRole("textbox", { name: "Requirements" });
    expect(requirements).toHaveAttribute("maxlength", "971");

    fireEvent.change(requirements, { target: { value: "x".repeat(972) } });

    expect(requirements).toHaveValue("Electron");
    expect(screen.getByRole("alert")).toHaveTextContent("requirements text must be at most 971 characters");
  });

  it("keeps the full draft visibly selectable when both copy mechanisms fail", async () => {
    // This catches a false fallback that tells people to select text after removing the only selected copy buffer.
    const writeText = vi.fn().mockRejectedValue(new Error("Clipboard denied"));
    const execCommand = vi.fn(() => false);
    Object.defineProperty(document, "execCommand", { configurable: true, value: execCommand });
    Object.assign(navigator, { clipboard: { writeText } });
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Add Electron" }));
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));
    fireEvent.click(screen.getByRole("button", { name: /Project BDB/ }));
    fireEvent.click(screen.getByRole("button", { name: "CREATE COLLABORATION BRIEF" }));

    fireEvent.click(screen.getByRole("button", { name: "COPY BRIEF" }));
    const fallback = await screen.findByRole("textbox", { name: "Copyable brief text" });

    expect(fallback).toHaveAttribute("readonly");
    expect(fallback).toHaveFocus();
    expect((fallback as HTMLTextAreaElement).value).toContain("PROJECT BRIEF");
    expect(screen.getByText("Brief could not be copied. The full draft is selected below for manual copy.")).toBeInTheDocument();
    expect(execCommand).toHaveBeenCalledWith("copy");
  });
});
