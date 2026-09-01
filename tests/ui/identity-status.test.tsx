import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";
import { useAppStore } from "../../src/state/appStore";

afterEach(() => { cleanup(); resetAppForTesting(); });

describe("Brenych Studio public identity", () => {
  it("explains the interface in the first workspace and links both fixed public destinations safely", () => {
    // This catches the challenge surface losing studio ownership or pointing creator-review traffic at an ambiguous environment URL.
    render(<App />);

    const header = document.querySelector<HTMLElement>(".app-header");
    if (!header) throw new Error("global app header is missing");
    const wordmark = within(header).getByRole("link", { name: /BRENYCH STUDIO/i });
    const studioLinks = screen.getAllByRole("link", { name: /VISIT BRENYCH STUDIO|BRENYCH STUDIO$/i });
    const source = screen.getByRole("link", { name: "VIEW SOURCE ↗" });

    expect(header).toHaveTextContent("AGENT INTERFACE");
    expect(wordmark).toHaveAttribute("href", "https://brenychstudio.com");
    expect(screen.getByRole("heading", { name: "A portfolio that can prove fit, not only present work." })).toBeInTheDocument();
    expect(screen.getByText(/People and AI agents can evaluate real requirements/)).toHaveTextContent(
      "People and AI agents can evaluate real requirements, inspect the proof behind a match and prepare a collaboration brief in the same live interface.",
    );
    expect(studioLinks.length).toBeGreaterThanOrEqual(2);
    for (const link of [...studioLinks, source]) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    expect(source).toHaveAttribute("href", "https://github.com/brenychstudio/brenych-agent-interface");
  });

  it("presents an absent host as Manual Mode and a ready host as Agent Tools Online", () => {
    // This catches truthful integration fallback being framed as a broken product or a ready host retaining the fallback label.
    render(<App />);

    const status = screen.getByLabelText("WebMCP host status");
    expect(status).toHaveTextContent("MANUAL MODE");
    expect(status).toHaveTextContent("Agent tools activate in a supported WebMCP host.");
    expect(status).not.toHaveTextContent(/unavailable/i);

    act(() => {
      useAppStore.getState().apply({
        type: "registration_changed",
        webMcpAvailable: true,
        registrationState: "ready",
        provenance: "webmcp",
      });
    });

    expect(status).toHaveTextContent("WEBMCP CONNECTED · AGENT TOOLS ONLINE");
    expect(status).not.toHaveTextContent("MANUAL MODE");
  });

  it.each([
    ["unavailable" as const, "MANUAL MODE"],
    ["error" as const, "MANUAL MODE"],
    ["registering" as const, "CONNECTING TO WEBMCP HOST"],
    ["idle" as const, "CHECKING FOR WEBMCP HOST"],
  ])("never claims a WebMCP connection while the host state is %s", (registrationState, expected) => {
    // This catches the challenge indicator advertising a live agent connection before one exists.
    render(<App />);

    act(() => {
      useAppStore.getState().apply({
        type: "registration_changed",
        webMcpAvailable: registrationState !== "unavailable",
        registrationState,
        provenance: "webmcp",
      });
    });

    const status = screen.getByLabelText("WebMCP host status");
    expect(status).toHaveTextContent(expected);
    expect(status).not.toHaveTextContent("WEBMCP CONNECTED");
    expect(status).toHaveAttribute("data-registration-state", registrationState);
  });

  it("keeps the manual browser fallback usable when no host is present", () => {
    // This catches the ready-state presentation work removing the product's manual path.
    render(<App />);

    expect(screen.getByLabelText("WebMCP host status")).toHaveTextContent("MANUAL MODE");
    fireEvent.click(screen.getByRole("button", { name: "Add Electron" }));
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));

    expect(screen.getByText("EVIDENCE COVERAGE")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Project BDB/ }));
    expect(screen.getByRole("heading", { name: "BDB", level: 2 })).toBeInTheDocument();
  });
});
