import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";

afterEach(() => { cleanup(); resetAppForTesting(); });

describe("bounded evidence-field navigation", () => {
  it("allows a small mouse drag on empty stage while keeping project activation direct", () => {
    render(<App />);
    const field = screen.getByTestId("evidence-field");

    fireEvent.pointerDown(field, { pointerId: 7, pointerType: "mouse", clientX: 100, clientY: 100 });
    fireEvent.pointerMove(field, { pointerId: 7, pointerType: "mouse", clientX: 500, clientY: 500 });
    fireEvent.pointerUp(field, { pointerId: 7, pointerType: "mouse", clientX: 500, clientY: 500 });

    expect(field).toHaveAttribute("data-pan-x", "18");
    expect(field).toHaveAttribute("data-pan-y", "12");
    expect(field).not.toHaveClass("is-dragging");

    fireEvent.click(screen.getByRole("button", { name: /Project BDB/ }));
    expect(screen.getByRole("heading", { name: "SELECTED EVIDENCE" })).toBeInTheDocument();
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
