import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";

// Motion resolves the reduced-motion preference on its first hook call, so the preference is
// installed before any component in this file renders.
beforeAll(() => {
  const reduced = {
    matches: true,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  };
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string) => (query.includes("prefers-reduced-motion")
      ? reduced
      : { ...reduced, matches: false, media: query }),
  });
});

afterEach(() => {
  cleanup();
  resetAppForTesting();
  document.getElementById("root")?.remove();
  document.body.removeAttribute("style");
});

const renderRealApp = () => {
  const root = document.createElement("div");
  root.id = "root";
  document.body.append(root);
  return { root, ...render(<App />, { container: root }) };
};

describe("reduced motion experience", () => {
  it("resolves the Inspect foreground to its final state with no staged delay", () => {
    // This catches reduced-motion users waiting through an entry sequence or losing delayed controls.
    renderRealApp();
    const stage = screen.getByTestId("experience-stage");
    expect(stage).toHaveAttribute("data-motion-mode", "reduced");

    fireEvent.click(screen.getByRole("button", { name: "Add Electron" }));
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));
    fireEvent.click(screen.getByRole("button", { name: /Project BDB/ }));

    expect(stage).toHaveAttribute("data-foreground-phase", "active");
    expect(screen.getByTestId("foreground-paper")).toHaveAttribute("data-foreground-phase", "active");
    expect(screen.getByRole("heading", { name: "BDB", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "BACK TO EVIDENCE" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "CREATE COLLABORATION BRIEF" })).toBeInTheDocument();
  });

  it("keeps the media viewer fully usable without travelling media", () => {
    // This catches reduced motion removing viewer functionality rather than only its motion.
    renderRealApp();
    fireEvent.click(screen.getByRole("button", { name: /Project BDB/ }));
    const inspect = screen.getByRole("region", { name: "BDB evidence inspect" });
    fireEvent.click(within(inspect).getByRole("button", { name: /VIEW FULL INTERFACE.*Task Control Center/ }));

    const dialog = screen.getByRole("dialog", { name: "BDB" });
    expect(screen.getByTestId("media-inspect")).toHaveAttribute("data-motion-state", "static-final");
    expect(within(dialog).getByRole("button", { name: "Close media viewer" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Next media" })).toBeInTheDocument();
    expect(within(dialog).getByText("1 / 2")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(within(dialog).getByText("2 / 2")).toBeInTheDocument();
  });

  it("leaves the spatial camera at rest instead of tracking the pointer", () => {
    // This catches parallax and pan still moving for people who asked for no motion.
    renderRealApp();
    const field = screen.getByTestId("evidence-field");

    fireEvent.pointerMove(field, { pointerId: 5, pointerType: "mouse", clientX: 900, clientY: 700 });
    fireEvent.pointerDown(field, { pointerId: 5, pointerType: "mouse", clientX: 100, clientY: 100 });
    fireEvent.pointerMove(field, { pointerId: 5, pointerType: "mouse", clientX: 600, clientY: 400 });

    expect(field).toHaveAttribute("data-pan-x", "0");
    expect(field).toHaveAttribute("data-pan-y", "0");
    expect(field).toHaveAttribute("data-parallax-x", "0");
    expect(field).toHaveAttribute("data-parallax-y", "0");
  });
});
