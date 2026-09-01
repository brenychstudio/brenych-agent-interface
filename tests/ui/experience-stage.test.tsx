import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    const inspect = screen.getByRole("heading", { name: "BDB", level: 2 });
    const background = field.closest("[data-stage-canvas]");

    expect(inspect.closest('[data-testid="experience-stage"]')).toBe(stage);
    expect(stage).toHaveAttribute("data-foreground", "inspect");
    expect(screen.getByTestId("foreground-paper")).toContainElement(inspect);
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
    expect(stage).toHaveAttribute("data-foreground", "brief");
    expect(screen.getByTestId("foreground-paper")).toContainElement(brief);
    expect(screen.getByTestId("evidence-field")).toBe(field);
    expect(background).toHaveAttribute("aria-hidden", "true");
    expect(background).toHaveAttribute("inert");
    expect(screen.queryByRole("heading", { name: "WHAT ARE YOU BUILDING?" })).not.toBeInTheDocument();
    expect(screen.queryByText("EVIDENCE-BACKED FIT")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "BDB", level: 2 })).not.toBeInTheDocument();
  });

  it("stages the cinematic foreground entry and returns to an idle field on exit", async () => {
    // This catches Inspect appearing as an instant hard cut, or the stage keeping a stale selection after Back.
    render(<App />);
    const stage = screen.getByTestId("experience-stage");
    expect(stage).toHaveAttribute("data-foreground-phase", "idle");
    expect(stage).toHaveAttribute("data-motion-mode", "full");
    expect(stage).not.toHaveAttribute("data-selected-project-id");

    fireEvent.click(screen.getByRole("button", { name: /Project BDB/ }));

    expect(stage).toHaveAttribute("data-selected-project-id", "bdb");
    expect(stage).toHaveAttribute("data-foreground-phase", "entering");
    expect(screen.getByTestId("foreground-paper")).toHaveAttribute("data-foreground-phase", "entering");
    await waitFor(
      () => expect(stage).toHaveAttribute("data-foreground-phase", "active"),
      { timeout: 3000 },
    );

    fireEvent.click(screen.getByRole("button", { name: "BACK TO EVIDENCE" }));

    expect(stage).toHaveAttribute("data-foreground-phase", "idle");
    expect(stage).not.toHaveAttribute("data-selected-project-id");
    expect(screen.queryByTestId("foreground-paper")).not.toBeInTheDocument();
  });

  it("wakes the selected field node and recedes its neighbours for the whole inspection", () => {
    // This catches the spatial field ignoring which record is being inspected behind the foreground.
    render(<App />);
    // The persistent field is deliberately aria-hidden behind the foreground, so read it from the DOM.
    const fieldNodes = (): HTMLElement[] => Array.from(
      screen.getByTestId("field-camera").querySelectorAll<HTMLElement>("button[data-project-id]"),
    );
    expect(fieldNodes().every((node) => node.dataset.inspectionState === "idle")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: /Project BDB/ }));

    const inspecting = fieldNodes();
    expect(inspecting.find((node) => node.dataset.projectId === "bdb"))
      .toHaveAttribute("data-inspection-state", "selected");
    expect(inspecting.filter((node) => node.dataset.projectId !== "bdb")
      .every((node) => node.dataset.inspectionState === "receded")).toBe(true);
    expect(inspecting.find((node) => node.dataset.projectId === "bdb"))
      .toHaveAttribute("data-entry-layout-id", "project-evidence-bdb");

    fireEvent.click(screen.getByRole("button", { name: "BACK TO EVIDENCE" }));

    expect(fieldNodes().every((node) => node.dataset.inspectionState === "idle")).toBe(true);
  });
});
