import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";

afterEach(() => { cleanup(); resetAppForTesting(); });

describe("real media evidence nodes", () => {
  it("uses approved media for four objects, two signals, and a closed seven-record index", () => {
    // This catches the latent NSC record appearing by default or becoming unreachable outside the constellation.
    render(<App />);
    const field = screen.getByTestId("evidence-field");
    const camera = field.querySelector<HTMLElement>(".field-camera");
    if (!camera) throw new Error("field camera is missing");
    const constellation = within(camera);

    expect(screen.getByText(/An agent can rank, focus, and draft from the same public evidence/i)).toBeInTheDocument();
    expect(screen.getByText(/^VISUALS: USER-APPROVED SCREENSHOTS/)).toBeInTheDocument();
    expect(screen.getByLabelText("Shared surface control provenance")).toHaveTextContent("SHARED HUMAN + AGENT SURFACE");

    expect(screen.getByText("4 EVIDENCE OBJECTS · 2 EXTENDED SIGNALS · 1 LATENT RECORD")).toBeInTheDocument();

    const bdb = constellation.getByRole("button", { name: /Project BDB, field, not evaluated/i });
    const bdbImage = within(bdb).getByRole("img", { name: /BDB task control center/i });
    expect(bdbImage).toHaveAttribute("src", "/evidence/bdb/bdb-task-control.webp");
    expect(bdbImage).toHaveAttribute("width", "1529");
    expect(bdbImage).toHaveAttribute("height", "976");
    expect(bdbImage).toHaveAttribute("decoding", "async");
    expect(bdbImage).toHaveAttribute("loading", "eager");

    for (const title of ["Distribution Desk", "Weekfield", "StoryForm"]) {
      const node = constellation.getByRole("button", { name: new RegExp(`Project ${title}, field, not evaluated`, "i") });
      expect(within(node).getByRole("img")).toHaveAttribute("loading", "lazy");
    }

    for (const title of ["SprintCRM", "Presence OS Memory Atlas"]) {
      const node = constellation.getByRole("button", { name: new RegExp(`Project ${title}, field, not evaluated`, "i") });
      expect(node).toHaveAttribute("data-media-kind", "signal");
      expect(node).toHaveAttribute("data-presentation-tier", "extended");
      expect(node).toHaveAttribute("data-visual-form", "extended-signal");
      expect(within(node).queryByRole("img")).not.toBeInTheDocument();
      expect(node).toHaveTextContent("EXTENDED EVIDENCE");
    }

    expect(constellation.getAllByRole("button", { name: /Project / })).toHaveLength(6);
    expect(constellation.queryByRole("button", { name: /Project Native Site Control/ })).not.toBeInTheDocument();

    const index = screen.getByText("FULL EVIDENCE INDEX").closest("details");
    if (!index) throw new Error("full evidence index is missing");
    expect(index).not.toHaveAttribute("open");
    expect(within(index).getByText("7 VERIFIED PROJECT RECORDS")).toBeInTheDocument();
    expect(within(index).getAllByRole("button", { hidden: true })).toHaveLength(7);
    expect(within(index).getByRole("button", { name: "Open Native Site Control evidence record", hidden: true }))
      .toHaveAttribute("data-project-id", "native-site-control");
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
    const camera = screen.getByTestId("evidence-field").querySelector<HTMLElement>(".field-camera");
    if (!camera) throw new Error("field camera is missing");
    expect(within(camera).getAllByRole("button", { name: /Project / })).toHaveLength(6);
    expect(screen.getByRole("button", { name: /Project Distribution Desk, rank 2, near, matched/i })).toHaveAttribute("data-spatial-tier", "near");
    expect(screen.getByRole("button", { name: /Project StoryForm, rank 3, near, matched/i })).toHaveAttribute("data-spatial-tier", "near");
    expect(screen.getByRole("button", { name: /Project Weekfield, rank 4, receded, partial/i })).toHaveAttribute("data-spatial-tier", "secondary");
    expect(screen.getByRole("button", { name: /Project Presence OS Memory Atlas/ })).toHaveAttribute("data-spatial-tier", "receded");
    expect(screen.getByLabelText("Shared surface control provenance")).toHaveTextContent("MANUAL ACTION");
  });

  it("promotes Native Site Control through the real requirement composer without fabricating media", () => {
    // This catches latent promotion using a synthetic fixture or rendering an invented NSC screenshot.
    render(<App />);
    const input = screen.getByRole("textbox", { name: "Add a requirement" });
    fireEvent.change(input, { target: { value: "Site-control architecture" } });
    fireEvent.click(screen.getByRole("button", { name: "Add requirement" }));
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));

    const camera = screen.getByTestId("evidence-field").querySelector<HTMLElement>(".field-camera");
    if (!camera) throw new Error("field camera is missing");
    const constellation = within(camera);
    const nativeSiteControl = constellation.getByRole("button", {
      name: /Project Native Site Control, rank 1, foreground, matched/i,
    });

    expect(constellation.getAllByRole("button", { name: /Project / })).toHaveLength(7);
    expect(nativeSiteControl).toHaveAttribute("data-spatial-tier", "dominant");
    expect(nativeSiteControl).toHaveAttribute("data-visual-form", "evidence-object");
    expect(nativeSiteControl).toHaveAttribute("data-media-kind", "typographic");
    expect(nativeSiteControl).toHaveTextContent("ARCHITECTURE FOUNDATION");
    expect(nativeSiteControl).toHaveTextContent("PUBLIC UI NOT YET AVAILABLE");
    expect(within(nativeSiteControl).queryByRole("img")).not.toBeInTheDocument();
  });
});
