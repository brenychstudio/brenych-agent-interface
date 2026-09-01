import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";

afterEach(() => { cleanup(); resetAppForTesting(); });

const evaluateElectron = (): void => {
  fireEvent.click(screen.getByRole("button", { name: "Add Electron" }));
  fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));
};

describe("single ExperienceStage", () => {
  it("keeps one Evidence Field mounted while Match and Inspect use the same stage area", () => {
    // This catches Inspect being appended after the workspace or rebuilding the spatial field between modes.
    render(<App />);
    const stage = screen.getByTestId("experience-stage");
    const field = screen.getByTestId("evidence-field");

    evaluateElectron();
    expect(screen.getByTestId("evidence-field")).toBe(field);
    expect(screen.getByText("EVIDENCE-BACKED FIT").closest('[data-testid="experience-stage"]')).toBe(stage);

    fireEvent.click(screen.getByRole("button", { name: /Project BDB/ }));
    const inspect = screen.getByRole("heading", { name: "SELECTED EVIDENCE" });
    const background = field.closest("[data-stage-canvas]");

    expect(inspect.closest('[data-testid="experience-stage"]')).toBe(stage);
    expect(screen.getByTestId("evidence-field")).toBe(field);
    expect(background).toHaveAttribute("aria-hidden", "true");
    expect(background).toHaveAttribute("inert");
    expect(screen.queryByRole("heading", { name: "WHAT ARE YOU BUILDING?" })).not.toBeInTheDocument();
    expect(screen.queryByText("EVIDENCE-BACKED FIT")).not.toBeInTheDocument();
  });

  it("replaces Inspect with Brief inside the stage without old foreground fragments", () => {
    // This catches Brief being appended over the composer, match panel, Inspect, or showcase instead of owning the foreground.
    render(<App />);
    const stage = screen.getByTestId("experience-stage");
    const field = screen.getByTestId("evidence-field");

    evaluateElectron();
    fireEvent.click(screen.getByRole("button", { name: /Project BDB/ }));
    fireEvent.click(screen.getByRole("button", { name: "CREATE COLLABORATION BRIEF" }));

    const brief = screen.getByRole("heading", { name: "PROJECT BRIEF" });
    const background = field.closest("[data-stage-canvas]");
    expect(brief.closest('[data-testid="experience-stage"]')).toBe(stage);
    expect(screen.getByTestId("evidence-field")).toBe(field);
    expect(background).toHaveAttribute("aria-hidden", "true");
    expect(background).toHaveAttribute("inert");
    expect(screen.queryByRole("heading", { name: "WHAT ARE YOU BUILDING?" })).not.toBeInTheDocument();
    expect(screen.queryByText("EVIDENCE-BACKED FIT")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "SELECTED EVIDENCE" })).not.toBeInTheDocument();
  });
});
