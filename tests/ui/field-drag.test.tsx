import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";

afterEach(() => { cleanup(); resetAppForTesting(); });

describe("bounded evidence-field navigation", () => {
  it("allows a perceptible bounded camera drag on empty stage while keeping project activation direct", () => {
    // This catches the field regressing to an imperceptible drag or becoming an unbounded canvas.
    render(<App />);
    const field = screen.getByTestId("evidence-field");

    fireEvent.pointerDown(field, { pointerId: 7, pointerType: "mouse", clientX: 100, clientY: 100 });
    fireEvent.pointerMove(field, { pointerId: 7, pointerType: "mouse", clientX: 500, clientY: 500 });
    fireEvent.pointerUp(field, { pointerId: 7, pointerType: "mouse", clientX: 500, clientY: 500 });

    expect(field).toHaveAttribute("data-pan-x", "76");
    expect(field).toHaveAttribute("data-pan-y", "42");
    expect(field).not.toHaveClass("is-dragging");

    fireEvent.pointerDown(field, { pointerId: 8, pointerType: "mouse", clientX: 500, clientY: 500 });
    fireEvent.pointerMove(field, { pointerId: 8, pointerType: "mouse", clientX: -500, clientY: -500 });
    fireEvent.pointerUp(field, { pointerId: 8, pointerType: "mouse", clientX: -500, clientY: -500 });

    expect(field).toHaveAttribute("data-pan-x", "-76");
    expect(field).toHaveAttribute("data-pan-y", "-42");

    fireEvent.click(screen.getByRole("button", { name: /Project BDB/ }));
    expect(screen.getByRole("heading", { name: "SELECTED EVIDENCE" })).toBeInTheDocument();
  });

  it("turns pointer position and project proximity into visible spatial state", () => {
    // This catches a decorative spatial field that does not react to cursor or project focus.
    render(<App />);
    const field = screen.getByTestId("evidence-field");
    const bdb = screen.getByRole("button", { name: /Project BDB/ });

    fireEvent.pointerMove(field, { pointerId: 2, pointerType: "mouse", clientX: 1200, clientY: 800 });
    expect(Number(field.getAttribute("data-parallax-x"))).toBeGreaterThan(0);
    expect(Number(field.getAttribute("data-parallax-y"))).toBeGreaterThan(0);

    fireEvent.pointerEnter(bdb, { pointerId: 2, pointerType: "mouse" });
    expect(bdb).toHaveAttribute("data-proximity", "active");
    expect(screen.getAllByRole("button", { name: /Project / }).some((node) => node.getAttribute("data-proximity") === "neighbor")).toBe(true);
  });

  it("renders four evidence objects and three keyboard-accessible extended signals by default", () => {
    // This catches extended evidence returning as three additional large flagship cards.
    render(<App />);
    const projects = screen.getAllByRole("button", { name: /Project / });
    const fullObjects = projects.filter((node) => node.getAttribute("data-visual-form") === "evidence-object");
    const signals = projects.filter((node) => node.getAttribute("data-visual-form") === "extended-signal");

    expect(fullObjects).toHaveLength(4);
    expect(signals).toHaveLength(3);
    expect(signals.every((node) => node.textContent?.includes("EXTENDED EVIDENCE"))).toBe(true);
    expect(signals.every((node) => node.tagName === "BUTTON")).toBe(true);
    expect(screen.queryByText("FIELD · NOT EVALUATED")).not.toBeInTheDocument();
    expect(screen.getByText("UNEVALUATED EVIDENCE FIELD")).toBeInTheDocument();
  });

  it("does not capture touch movement that belongs to page scrolling", () => {
    render(<App />);
    const field = screen.getByTestId("evidence-field");

    fireEvent.pointerDown(field, { pointerId: 3, pointerType: "touch", clientX: 50, clientY: 50 });
    fireEvent.pointerMove(field, { pointerId: 3, pointerType: "touch", clientX: 200, clientY: 200 });

    expect(field).toHaveAttribute("data-pan-x", "0");
    expect(field).toHaveAttribute("data-pan-y", "0");
  });
});
