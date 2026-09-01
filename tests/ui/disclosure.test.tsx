import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";
import { AnimatedDisclosure } from "../../src/components/AnimatedDisclosure";

afterEach(() => {
  cleanup();
  resetAppForTesting();
  vi.restoreAllMocks();
});

describe("animated disclosure", () => {
  it("exposes a real expandable control wired to its own panel", () => {
    // This catches a disclosure that looks expandable but never tells assistive technology what it controls.
    render(
      <AnimatedDisclosure label="FULL EVIDENCE INDEX">
        <p>panel body</p>
      </AnimatedDisclosure>,
    );

    const trigger = screen.getByRole("button", { name: /FULL EVIDENCE INDEX/ });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    const panelId = trigger.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const panel = document.getElementById(panelId ?? "");
    expect(panel).not.toBeNull();
    expect(panel).toContainElement(screen.getByText("panel body"));
  });

  it("keeps the panel mounted through its exit animation instead of cutting content away", async () => {
    // This catches the abrupt close the creator review flagged: content vanishing before it animates out.
    render(
      <AnimatedDisclosure label="VIEW EVIDENCE DETAILS" defaultOpen>
        <p>closing body</p>
      </AnimatedDisclosure>,
    );
    const trigger = screen.getByRole("button", { name: /VIEW EVIDENCE DETAILS/ });
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("closing body")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("closing body")).not.toBeInTheDocument());
  });

  it("reports open state changes and activates from the keyboard", () => {
    // This catches a div-based toggle that keyboard users cannot reach or that never notifies its owner.
    const onOpenChange = vi.fn();
    render(
      <AnimatedDisclosure label="FULL EVIDENCE INDEX" onOpenChange={onOpenChange}>
        <p>keyboard body</p>
      </AnimatedDisclosure>,
    );

    const trigger = screen.getByRole("button", { name: /FULL EVIDENCE INDEX/ });
    expect(trigger.tagName).toBe("BUTTON");
    trigger.focus();
    fireEvent.click(trigger);

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(trigger).toHaveFocus();
  });
});

describe("disclosure surfaces in the application", () => {
  it("animates the full evidence index without disturbing the spatial field", () => {
    // This catches the index regressing to an abrupt toggle, losing a record, or starting a field drag.
    render(<App />);
    const field = screen.getByTestId("evidence-field");
    const trigger = screen.getByRole("button", { name: /FULL EVIDENCE INDEX/ });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("7 VERIFIED PROJECT RECORDS")).toBeInTheDocument();

    fireEvent.pointerDown(trigger, { pointerId: 21, pointerType: "mouse", clientX: 120, clientY: 120 });
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const panel = document.getElementById(trigger.getAttribute("aria-controls") ?? "");
    if (!panel) throw new Error("index panel is missing");
    expect(within(panel).getAllByRole("button", { name: /^Open .* evidence record$/ })).toHaveLength(7);
    expect(within(panel).getByRole("button", { name: "Open Native Site Control evidence record" })).toBeInTheDocument();
    expect(field).toHaveAttribute("data-pan-x", "0");
    expect(field).toHaveAttribute("data-pan-y", "0");
  });

  it("animates the inspect evidence details while preserving every provenance record", () => {
    // This catches the details disclosure losing claims, provenance, or limitations during the rework.
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Project BDB/ }));

    const trigger = screen.getByRole("button", { name: /VIEW EVIDENCE DETAILS/ });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);

    const panel = document.getElementById(trigger.getAttribute("aria-controls") ?? "");
    if (!panel) throw new Error("details panel is missing");
    expect(within(panel).getByText("EVIDENCE VISIBILITY")).toBeInTheDocument();
    expect(within(panel).getByText("KNOWN LIMITATIONS")).toBeInTheDocument();
    expect(within(panel).getByText("Public-safe summary identifies an Electron desktop interface.")).toBeInTheDocument();
    expect(within(panel).getAllByText(/EVIDENCE VISIBILITY:/).length).toBeGreaterThan(0);
    expect(within(panel).getAllByText(/SOURCE:/).length).toBeGreaterThan(0);
    expect(within(panel).getByText("Only the public-safe summary is represented.")).toBeInTheDocument();
  });

  it("returns focus to the exact index record that opened a latent project", () => {
    // This catches the index closing on return, or focus landing on a different project button.
    render(<App />);
    const trigger = screen.getByRole("button", { name: /FULL EVIDENCE INDEX/ });
    fireEvent.click(trigger);
    const origin = screen.getByRole("button", { name: "Open Native Site Control evidence record" });

    fireEvent.click(origin);
    expect(screen.getByRole("heading", { name: "Native Site Control", level: 2 })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(origin).toHaveFocus();
    expect(screen.getByRole("button", { name: /FULL EVIDENCE INDEX/ })).toHaveAttribute("aria-expanded", "true");
  });
});
