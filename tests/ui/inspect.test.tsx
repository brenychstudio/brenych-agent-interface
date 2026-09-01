import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";

const inspectCss = readFileSync("src/styles/inspect.css", "utf8");
const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
const scrollIntoView = vi.fn();

beforeEach(() => {
  scrollIntoView.mockClear();
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: scrollIntoView });
});

afterEach(() => {
  cleanup();
  resetAppForTesting();
  if (originalScrollIntoView) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: originalScrollIntoView });
  else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
});

describe("project evidence inspect", () => {
  it("keeps the matched field mounted and exposes BDB's derived public evidence", () => {
    // This catches an inspect route/rebuild or a surface that invents a selection reason instead of using the match.
    render(<App />);
    const field = screen.getByTestId("evidence-field");

    fireEvent.click(screen.getByRole("button", { name: "Add Electron" }));
    fireEvent.click(screen.getByRole("button", { name: "Add MCP" }));
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));
    fireEvent.click(screen.getByRole("button", { name: /Project BDB/ }));

    const selectedNode = field.querySelector<HTMLButtonElement>('button[data-project-id="bdb"]');
    const peerNode = field.querySelector<HTMLButtonElement>('button[data-project-id="distribution-desk"]');
    if (!selectedNode || !peerNode) throw new Error("persistent project nodes are missing");
    expect(screen.getByRole("heading", { name: "BDB", level: 2 }).closest("section")).toHaveAttribute("data-surface", "integrated-shell");
    expect(selectedNode).toHaveClass("is-inspect-selected");
    expect(selectedNode).toHaveTextContent("INSPECT SELECTED");
    expect(peerNode).toHaveClass("is-inspect-receded");
    expect(peerNode).toHaveTextContent("INSPECT BACKGROUND");
    expect(screen.getByRole("heading", { name: "BDB", level: 2 })).toHaveFocus();
    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(within(screen.getByRole("region", { name: "BDB evidence media" })).getAllByText(/USER-APPROVED VISUAL EVIDENCE/)).toHaveLength(2);
    expect(screen.getByText("WHAT THIS PROJECT IS")).toBeInTheDocument();
    expect(screen.getByText("WHY IT WAS SELECTED")).toBeInTheDocument();
    expect(screen.getByText("Selected BDB; evidence directly supports electron, mcp.")).toBeInTheDocument();
    expect(screen.getByText("VERIFICATION").parentElement).toHaveTextContent("OWNER-VERIFIED IMPLEMENTATION");
    expect(screen.getByRole("region", { name: "MATCHED REQUIREMENTS" })).toHaveTextContent("Electron");
    expect(screen.getByRole("region", { name: "VERIFIED HIGHLIGHTS" })).toHaveTextContent("Local-first development control plane");
    expect(screen.getByText("PUBLIC / PRIVATE BOUNDARY")).toBeInTheDocument();
    expect(screen.getByText("PUBLIC SUMMARY", { selector: ".boundary-label" })).toBeInTheDocument();
    const detailsTrigger = screen.getByRole("button", { name: /VIEW EVIDENCE DETAILS/ });
    expect(detailsTrigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(detailsTrigger);
    const details = document.getElementById(detailsTrigger.getAttribute("aria-controls") ?? "");
    expect(details).toContainElement(screen.getByText("Public-safe summary identifies an Electron desktop interface."));
    expect(screen.getAllByText(/EVIDENCE VISIBILITY:/)).not.toHaveLength(0);
    expect(screen.getByText("Only the public-safe summary is represented.")).toBeInTheDocument();
    expect(screen.queryByText(/owner_verified_private|public_summary_only/)).not.toBeInTheDocument();
    const media = screen.getByRole("region", { name: "BDB evidence media" });
    const mediaImages = within(media).getAllByRole("img");
    expect(mediaImages).toHaveLength(2);
    expect(mediaImages[0]).toHaveAttribute("loading", "eager");
    expect(mediaImages[1]).toHaveAttribute("loading", "lazy");
    expect(mediaImages[0]).toHaveAttribute("data-fit", "contain");
    expect(mediaImages[0]).toHaveStyle({ aspectRatio: "1529 / 976" });
    expect(mediaImages[1]).toHaveAttribute("data-fit", "contain");
    expect(mediaImages[1]).toHaveStyle({ aspectRatio: "954 / 870" });
    expect(screen.getByTestId("evidence-field")).toBe(field);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("heading", { name: "BDB", level: 2 })).not.toBeInTheDocument();
    expect(screen.getByText("EVIDENCE COVERAGE")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Project BDB/ })).toHaveFocus();
  });

  it("describes a manual open without presenting missing match evidence as an error", () => {
    // This catches manual inspection inheriting match-only empty-state copy that implies evidence failure.
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Project BDB/ }));

    expect(screen.getByText("Opened manually. Evaluate requirements to see evidence-backed relevance.")).toBeInTheDocument();
    expect(screen.queryByText(/No directly matched requirements/i)).not.toBeInTheDocument();
  });

  it("opens honest Native Site Control evidence from the index and restores that exact origin", () => {
    // This catches a latent record becoming unreachable, fabricating public UI, or restoring focus to a different button.
    render(<App />);
    const indexTrigger = screen.getByRole("button", { name: /FULL EVIDENCE INDEX/ });
    fireEvent.click(indexTrigger);
    const origin = screen.getByRole("button", { name: "Open Native Site Control evidence record" });
    fireEvent.click(origin);

    const inspect = screen.getByRole("region", { name: "Native Site Control evidence inspect" });
    expect(screen.getByRole("heading", { name: "Native Site Control", level: 2 })).toHaveFocus();
    expect(within(inspect).getByText("ARCHITECTURE FOUNDATION")).toBeInTheDocument();
    expect(within(inspect).getByText("PUBLIC UI NOT YET AVAILABLE")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Native Site Control evidence media" })).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /Native Site Control/i })).not.toBeInTheDocument();
    const foundation = screen.getByRole("region", { name: "ARCHITECTURE FOUNDATION" });
    expect(within(foundation).getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "typed site contracts",
      "site manifest",
      "revision model",
      "validation and apply boundaries",
      "repository provider boundary",
      "deployment provider boundary",
    ]);
    expect(screen.queryByText(/Admin UI/i)).not.toBeInTheDocument();
    expect(within(inspect).queryByRole("link")).not.toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(origin).toHaveFocus();
    expect(screen.getByRole("button", { name: /FULL EVIDENCE INDEX/ })).toHaveAttribute("aria-expanded", "true");
  });

  it("restores the pre-inspect page position and originating focus without an automatic scroll", () => {
    // This catches in-place Inspect still moving the document or returning to a different point in the field.
    const scrollTo = vi.fn();
    Object.defineProperty(window, "scrollY", { configurable: true, value: 420 });
    Object.defineProperty(window, "scrollTo", { configurable: true, value: scrollTo });
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Add Electron" }));
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));
    const bdb = screen.getByRole("button", { name: /Project BDB/ });
    fireEvent.click(bdb);

    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
    fireEvent.keyDown(document, { key: "Escape" });

    expect(scrollTo).toHaveBeenCalledWith({ left: 0, top: 420, behavior: "instant" });
    expect(screen.getByRole("button", { name: /Project BDB/ })).toHaveFocus();
  });

  it("labels one-hop related evidence separately from direct matches", () => {
    // This catches a 0.45 relation being presented as if the project directly demonstrated the requirement.
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Add MCP" }));
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));
    fireEvent.click(screen.getByRole("button", { name: /Project Weekfield/ }));

    expect(screen.getByText("Selected Weekfield; evidence is related to mcp.")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "MATCHED REQUIREMENTS" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "PARTIAL / RELATED EVIDENCE" })).toHaveTextContent("MCP");
  });

  it("bounds the cinematic title before its primary media plane", () => {
    expect(inspectCss).toMatch(/\.inspect-surface h2 \{[^}]*font-size: clamp\(3rem, 4\.4vw, 5\.6rem\)/);
  });

  it("authors a single predictable focus ring for programmatically focused surface headings", () => {
    expect(inspectCss).toMatch(/\.inspect-surface h2:focus-visible,[\s\S]*\.brief-surface h2:focus-visible \{[^}]*outline: 2px solid var\(--ink\);[^}]*outline-offset: \.35rem/);
  });

  it("keeps every Inspect media rule uncropped at every breakpoint", () => {
    // This catches desktop or mobile Inspect media reverting to fixed-height cover cropping.
    expect(inspectCss).toMatch(/\.inspect-media-frame \{[^}]*width: 100%;[^}]*background: var\(--paper-deep\)/);
    expect(inspectCss).toMatch(/\.inspect-media-frame img \{[^}]*width: 100%;[^}]*height: auto;[^}]*object-fit: contain;[^}]*object-position: center/);
    expect(inspectCss).not.toMatch(/\.inspect-media(?:-frame)?[^{}]*\{[^}]*object-fit:\s*cover/);
    expect(inspectCss).not.toMatch(/\.inspect-media-frame img \{[^}]*aspect-ratio:\s*16\s*\/\s*10/);
  });

  it("keeps Inspect in the stable stage while its foreground owns document flow", () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Project BDB/ }));

    const inspect = screen.getByRole("region", { name: "BDB evidence inspect" });
    expect(inspect.closest(".stage-foreground--inspect")).toBeInTheDocument();
    expect(inspect.closest("[data-testid='experience-stage']")).toBeInTheDocument();
    expect(inspect).toHaveAttribute("data-scroll-owner", "document");
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("orders Inspect as identity, complete media, public summary and evidence rail", () => {
    // This catches the generic surface label becoming the page title or the rail overtaking the reading order.
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Add Electron" }));
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));
    fireEvent.click(screen.getByRole("button", { name: /Project BDB/ }));

    const inspect = screen.getByRole("region", { name: "BDB evidence inspect" });
    const zones = Array.from(inspect.querySelectorAll<HTMLElement>("[data-inspect-zone]"))
      .map((zone) => zone.dataset.inspectZone);
    expect(zones).toEqual(["identity", "media", "summary", "rail"]);

    const identity = inspect.querySelector<HTMLElement>('[data-inspect-zone="identity"]');
    if (!identity) throw new Error("identity zone is missing");
    expect(within(identity).getByRole("heading", { level: 2 })).toHaveTextContent("BDB");
    expect(within(identity).getByText("01 / SELECTED EVIDENCE").tagName).toBe("P");
    expect(within(identity).queryByRole("heading", { name: /SELECTED EVIDENCE/ })).not.toBeInTheDocument();

    const media = inspect.querySelector<HTMLElement>('[data-inspect-zone="media"]');
    if (!media) throw new Error("media zone is missing");
    expect(within(media).getAllByRole("button", { name: /^VIEW FULL INTERFACE ↗ — / })).toHaveLength(2);
    expect(within(media).getAllByRole("img").every((image) => image.getAttribute("data-fit") === "contain")).toBe(true);

    expect(inspect.querySelector('[data-inspect-zone="summary"]'))
      .toHaveAttribute("data-line-length", "summary");

    const rail = inspect.querySelector<HTMLElement>('[data-inspect-zone="rail"]');
    if (!rail) throw new Error("evidence rail is missing");
    ["MATURITY", "VERIFICATION", "EVIDENCE VISIBILITY"].forEach((term) => {
      expect(within(rail).getByText(term).tagName).toBe("DT");
    });
    expect(within(rail).getByText("PUBLIC / PRIVATE BOUNDARY")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /VIEW EVIDENCE DETAILS/ })).toHaveAttribute("aria-expanded", "false");
  });

  it("offers a live continuation only where the evidence record already holds a verified site", () => {
    // This catches a case study or repository being promoted into an invented live-site call to action.
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Project Presence OS Memory Atlas/ }));

    const presence = screen.getByRole("region", { name: "Presence OS Memory Atlas evidence inspect" });
    const live = within(presence).getByRole("link", { name: "OPEN LIVE SITE ↗" });
    expect(live).toHaveAttribute("href", "https://brenychstudio.com/immersive/presence-os-memory-atlas");
    expect(live).toHaveAttribute("target", "_blank");
    expect(live).toHaveAttribute("rel", "noopener noreferrer");

    fireEvent.click(within(presence).getByRole("button", { name: "BACK TO EVIDENCE" }));
    fireEvent.click(screen.getByRole("button", { name: /Project SprintCRM/ }));

    const sprint = screen.getByRole("region", { name: "SprintCRM evidence inspect" });
    expect(within(sprint).queryByRole("link", { name: "OPEN LIVE SITE ↗" })).not.toBeInTheDocument();
    expect(within(sprint).getByRole("link", { name: "Public case" }))
      .toHaveAttribute("href", "https://brenychstudio.com/work/sprintcrm");
    expect(within(sprint).getByRole("link", { name: "Public repository" }))
      .toHaveAttribute("href", "https://github.com/brenychstudio/SprintCRM");
    within(sprint).getAllByRole("link").forEach((link) => {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });
});
