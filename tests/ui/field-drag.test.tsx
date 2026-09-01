import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";

afterEach(() => { cleanup(); resetAppForTesting(); vi.restoreAllMocks(); });

// Camera diagnostics are written once per animation frame, never once per pointer pixel.
const flushFrame = async (): Promise<void> => {
  await act(async () => {
    await new Promise<void>((resolve) => { requestAnimationFrame(() => resolve()); });
  });
};

const mockFieldBounds = (field: HTMLElement): void => {
  vi.spyOn(field, "getBoundingClientRect").mockReturnValue({
    x: 0, y: 0, top: 0, left: 0, right: 1000, bottom: 600, width: 1000, height: 600,
    toJSON: () => ({}),
  } as DOMRect);
};

describe("bounded evidence-field navigation", () => {
  it("allows a perceptible bounded camera drag on empty stage while keeping project activation direct", async () => {
    // This catches the field regressing to an imperceptible drag or becoming an unbounded canvas.
    render(<App />);
    const field = screen.getByTestId("evidence-field");

    fireEvent.pointerDown(field, { pointerId: 7, pointerType: "mouse", clientX: 100, clientY: 100 });
    fireEvent.pointerMove(field, { pointerId: 7, pointerType: "mouse", clientX: 500, clientY: 500 });
    fireEvent.pointerUp(field, { pointerId: 7, pointerType: "mouse", clientX: 500, clientY: 500 });
    await flushFrame();

    expect(field).toHaveAttribute("data-pan-x", "76");
    expect(field).toHaveAttribute("data-pan-y", "42");
    expect(field).not.toHaveClass("is-dragging");

    fireEvent.pointerDown(field, { pointerId: 8, pointerType: "mouse", clientX: 500, clientY: 500 });
    fireEvent.pointerMove(field, { pointerId: 8, pointerType: "mouse", clientX: -500, clientY: -500 });
    fireEvent.pointerUp(field, { pointerId: 8, pointerType: "mouse", clientX: -500, clientY: -500 });
    await flushFrame();

    expect(field).toHaveAttribute("data-pan-x", "-76");
    expect(field).toHaveAttribute("data-pan-y", "-42");

    fireEvent.click(screen.getByRole("button", { name: /Project BDB/ }));
    expect(screen.getByRole("heading", { name: "BDB", level: 2 })).toBeInTheDocument();
  });

  it("turns pointer position and project proximity into visible spatial state", async () => {
    // This catches a decorative spatial field that does not react to cursor or project focus.
    render(<App />);
    const field = screen.getByTestId("evidence-field");
    const bdb = screen.getByRole("button", { name: /Project BDB/ });

    fireEvent.pointerMove(field, { pointerId: 2, pointerType: "mouse", clientX: 1200, clientY: 800 });
    await flushFrame();
    expect(Number(field.getAttribute("data-parallax-x"))).toBeGreaterThan(0);
    expect(Number(field.getAttribute("data-parallax-y"))).toBeGreaterThan(0);

    fireEvent.pointerEnter(bdb, { pointerId: 2, pointerType: "mouse" });
    expect(bdb).toHaveAttribute("data-proximity", "active");
    expect(screen.getAllByRole("button", { name: /Project / }).some((node) => node.getAttribute("data-proximity") === "neighbor")).toBe(true);
  });

  it("renders four evidence objects and two keyboard-accessible extended signals by default", () => {
    // This catches latent evidence returning as a default card or one of the two signals disappearing.
    render(<App />);
    const camera = screen.getByTestId("evidence-field").querySelector(".field-camera");
    if (!camera) throw new Error("field camera is missing");
    const projects = Array.from(camera.querySelectorAll<HTMLButtonElement>("button[data-project-id]"));
    const fullObjects = projects.filter((node) => node.getAttribute("data-visual-form") === "evidence-object");
    const signals = projects.filter((node) => node.getAttribute("data-visual-form") === "extended-signal");

    expect(fullObjects).toHaveLength(4);
    expect(signals).toHaveLength(2);
    expect(signals.every((node) => node.textContent?.includes("EXTENDED EVIDENCE"))).toBe(true);
    expect(signals.every((node) => node.tagName === "BUTTON")).toBe(true);
    expect(screen.queryByText("FIELD · NOT EVALUATED")).not.toBeInTheDocument();
    expect(screen.getByText("UNEVALUATED EVIDENCE FIELD")).toBeInTheDocument();
  });

  it("toggles the native evidence index without changing field pan", async () => {
    // This catches the disclosure summary starting a field drag or inheriting pointer movement as pan.
    render(<App />);
    const field = screen.getByTestId("evidence-field");
    const trigger = screen.getByRole("button", { name: /FULL EVIDENCE INDEX/ });

    fireEvent.pointerDown(trigger, { pointerId: 12, pointerType: "mouse", clientX: 100, clientY: 100 });
    fireEvent.pointerMove(field, { pointerId: 12, pointerType: "mouse", clientX: 500, clientY: 500 });
    fireEvent.pointerUp(field, { pointerId: 12, pointerType: "mouse", clientX: 500, clientY: 500 });
    fireEvent.click(trigger);
    await flushFrame();

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(field).toHaveAttribute("data-pan-x", "0");
    expect(field).toHaveAttribute("data-pan-y", "0");
  });

  it("does not capture touch movement that belongs to page scrolling", async () => {
    render(<App />);
    const field = screen.getByTestId("evidence-field");

    fireEvent.pointerDown(field, { pointerId: 3, pointerType: "touch", clientX: 50, clientY: 50 });
    fireEvent.pointerMove(field, { pointerId: 3, pointerType: "touch", clientX: 200, clientY: 200 });
    await flushFrame();

    expect(field).toHaveAttribute("data-pan-x", "0");
    expect(field).toHaveAttribute("data-pan-y", "0");
  });

  it("keeps React renders flat while hover parallax reaches both bounds", async () => {
    // This catches pointer parallax scheduling a React render per pixel instead of driving MotionValues.
    render(<App />);
    const field = screen.getByTestId("evidence-field");
    const camera = screen.getByTestId("field-camera");
    mockFieldBounds(field);
    await flushFrame();
    const renders = field.getAttribute("data-render-count");
    const cameraStart = camera.getAttribute("data-camera-x");

    for (let move = 0; move < 50; move += 1) {
      fireEvent.pointerMove(field, { pointerId: 4, pointerType: "mouse", clientX: 500 + move, clientY: 300 + move });
    }
    fireEvent.pointerMove(field, { pointerId: 4, pointerType: "mouse", clientX: 1000, clientY: 600 });
    await flushFrame();

    expect(field).toHaveAttribute("data-render-count", renders);
    expect(field).toHaveAttribute("data-parallax-x", "18");
    expect(field).toHaveAttribute("data-parallax-y", "12");
    expect(camera.getAttribute("data-camera-x")).not.toBe(cameraStart);

    fireEvent.pointerMove(field, { pointerId: 4, pointerType: "mouse", clientX: 0, clientY: 0 });
    await flushFrame();

    expect(field).toHaveAttribute("data-parallax-x", "-18");
    expect(field).toHaveAttribute("data-parallax-y", "-12");
    expect(field).toHaveAttribute("data-render-count", renders);
  });

  it("keeps React renders flat while a drag sweeps the full pan range", async () => {
    // This catches drag pan rerendering the whole field, including after the value is already clamped.
    render(<App />);
    const field = screen.getByTestId("evidence-field");
    mockFieldBounds(field);
    fireEvent.pointerDown(field, { pointerId: 9, pointerType: "mouse", clientX: 100, clientY: 100 });
    await flushFrame();
    const renders = field.getAttribute("data-render-count");

    for (let move = 1; move <= 50; move += 1) {
      fireEvent.pointerMove(field, { pointerId: 9, pointerType: "mouse", clientX: 100 + move * 8, clientY: 100 + move * 4 });
    }
    await flushFrame();

    expect(field).toHaveAttribute("data-render-count", renders);
    expect(field).toHaveAttribute("data-pan-x", "76");
    expect(field).toHaveAttribute("data-pan-y", "42");

    for (let move = 1; move <= 50; move += 1) {
      fireEvent.pointerMove(field, { pointerId: 9, pointerType: "mouse", clientX: 100 - move * 8, clientY: 100 - move * 4 });
    }
    await flushFrame();

    expect(field).toHaveAttribute("data-render-count", renders);
    expect(field).toHaveAttribute("data-pan-x", "-76");
    expect(field).toHaveAttribute("data-pan-y", "-42");

    fireEvent.pointerUp(field, { pointerId: 9, pointerType: "mouse", clientX: -300, clientY: -100 });
    expect(field).not.toHaveClass("is-dragging");
  });
});
