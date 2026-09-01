import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";

afterEach(() => { cleanup(); resetAppForTesting(); });

describe("real media evidence nodes", () => {
  it("uses approved media for flagship projects and peripheral signals for extended evidence", () => {
    // This catches fake screenshot placeholders or approved core media failing to reach the evidence field.
    render(<App />);

    expect(screen.getByText(/An agent can rank, focus, and draft from the same public evidence/i)).toBeInTheDocument();
    expect(screen.getByText(/^VISUALS: USER-APPROVED SCREENSHOTS/)).toBeInTheDocument();
    expect(screen.getByLabelText("Shared surface control provenance")).toHaveTextContent("SHARED HUMAN + AGENT SURFACE");

    const bdb = screen.getByRole("button", { name: /Project BDB, field, not evaluated/i });
    const bdbImage = within(bdb).getByRole("img", { name: /BDB task control center/i });
    expect(bdbImage).toHaveAttribute("src", "/evidence/bdb/bdb-task-control.webp");
    expect(bdbImage).toHaveAttribute("width", "1529");
    expect(bdbImage).toHaveAttribute("height", "976");
    expect(bdbImage).toHaveAttribute("decoding", "async");
    expect(bdbImage).toHaveAttribute("loading", "eager");

    for (const title of ["Distribution Desk", "Weekfield", "StoryForm"]) {
      const node = screen.getByRole("button", { name: new RegExp(`Project ${title}, field, not evaluated`, "i") });
      expect(within(node).getByRole("img")).toHaveAttribute("loading", "lazy");
    }

    for (const title of ["SprintCRM", "Native Site Control", "Presence OS Memory Atlas"]) {
      const node = screen.getByRole("button", { name: new RegExp(`Project ${title}, field, not evaluated`, "i") });
      expect(node).toHaveAttribute("data-media-kind", "signal");
      expect(node).toHaveAttribute("data-presentation-tier", "extended");
      expect(node).toHaveAttribute("data-visual-form", "extended-signal");
      expect(within(node).queryByRole("img")).not.toBeInTheDocument();
      expect(node).toHaveTextContent("EXTENDED EVIDENCE");
    }

    expect(screen.getAllByRole("button", { name: /Project / })).toHaveLength(7);
  });

  it("recomposes semantic rank tiers while keeping every project visible", () => {
    // This catches match mode changing labels without producing the required deterministic spatial hierarchy.
    render(<App />);
    const bdbBefore = screen.getByRole("button", { name: /Project BDB, field, not evaluated/i });
    const defaultX = bdbBefore.style.getPropertyValue("--node-x");

    fireEvent.click(screen.getByRole("button", { name: "Add Electron" }));
    fireEvent.click(screen.getByRole("button", { name: "Add MCP" }));
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));

    const bdb = screen.getByRole("button", { name: /Project BDB, rank 1, foreground, matched/i });
    expect(bdb).toHaveAttribute("data-spatial-tier", "dominant");
    expect(bdb.style.getPropertyValue("--node-x")).not.toBe(defaultX);
    expect(screen.getAllByRole("button", { name: /Project / })).toHaveLength(7);
    expect(screen.getByRole("button", { name: /Project Distribution Desk, rank 2, near, matched/i })).toHaveAttribute("data-spatial-tier", "near");
    expect(screen.getByRole("button", { name: /Project StoryForm, rank 3, near, matched/i })).toHaveAttribute("data-spatial-tier", "near");
    expect(screen.getByRole("button", { name: /Project Weekfield, rank 4, receded, partial/i })).toHaveAttribute("data-spatial-tier", "secondary");
    expect(screen.getByRole("button", { name: /Project Presence OS Memory Atlas/ })).toHaveAttribute("data-spatial-tier", "receded");
    expect(screen.getByLabelText("Shared surface control provenance")).toHaveTextContent("MANUAL ACTION");
  });
});
