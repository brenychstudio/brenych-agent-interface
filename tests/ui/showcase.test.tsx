import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { readFileSync } from "node:fs";

import { App, resetAppForTesting } from "../../src/app/App";

const showcaseCss = readFileSync("src/styles/showcase.css", "utf8");

afterEach(() => { cleanup(); resetAppForTesting(); });

describe("supporting studio proof layer", () => {
  it("renders exactly four media-led systems behind an explicit non-scoring boundary", () => {
    render(<App />);

    const showcase = screen.getByRole("region", { name: "Selected studio systems" });
    expect(within(showcase).getByRole("heading", { name: "SELECTED STUDIO SYSTEMS" })).toBeInTheDocument();
    expect(within(showcase).getByText("Creative, spatial and product interfaces from the wider Brenych Studio practice.")).toBeInTheDocument();
    expect(within(showcase).getByText("SUPPORTING PROOF — NON-SCORING")).toBeInTheDocument();
    expect(within(showcase).getByText("NOT INCLUDED IN EVIDENCE COVERAGE")).toBeInTheDocument();
    expect(within(showcase).getByText(/SHOWCASE VISUALS: USER-APPROVED SCREENSHOTS/)).toBeInTheDocument();
    expect(within(showcase).getAllByRole("article")).toHaveLength(4);
    expect(within(showcase).getAllByRole("img")).toHaveLength(8);
    expect(within(showcase).getAllByRole("img").every((image) => image.getAttribute("loading") === "lazy")).toBe(true);
    ["WEBHERO", "PHOTO WEB", "ARTIST STAGE", "MODEL SITE"].forEach((title) => {
      expect(within(showcase).getByRole("heading", { name: title })).toBeInTheDocument();
    });
  });

  it("subdues supporting proof in Match without making it look disabled", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Add Electron" }));
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));

    const showcase = screen.getByRole("region", { name: "Selected studio systems" });
    expect(showcase).toHaveClass("is-subdued");
    expect(showcase).not.toHaveClass("is-quiet");
    expect(within(showcase).getAllByRole("article")).toHaveLength(4);
  });

  it("leaves Inspect and Brief as clean foreground modes without the showcase", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Add Electron" }));
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));
    fireEvent.click(screen.getByRole("button", { name: /Project BDB/ }));

    expect(screen.queryByRole("region", { name: "Selected studio systems" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "CREATE COLLABORATION BRIEF" }));

    expect(screen.queryByRole("region", { name: "Selected studio systems" })).not.toBeInTheDocument();
  });

  it("authors each system as one chapter with exactly three presentation labels", () => {
    // This catches showcase copy drifting from the approved chapter text or growing extra labels.
    render(<App />);
    const showcase = screen.getByRole("region", { name: "Selected studio systems" });
    const chapters = within(showcase).getAllByRole("article");
    expect(chapters).toHaveLength(4);

    const expected = [
      ["WEBHERO", "Living visual systems and spatial web R&D where WebGL stages, atmosphere, media and spatial presentation behave as one interface infrastructure.", ["WEBGL STAGES", "SPATIAL MEDIA", "LIVING INTERFACES"]],
      ["PHOTO WEB", "An authored art-fashion archive where photography, series and cinematic navigation operate as one living editorial field.", ["EDITORIAL SYSTEM", "CINEMATIC NAVIGATION", "ART ARCHIVE"]],
      ["ARTIST STAGE", "A cinematic artist and collector interface built around living artwork fields, spatial series, object inspection and collector-facing routes.", ["ARTWORK SYSTEM", "COLLECTOR INTERFACE", "SPATIAL SERIES"]],
      ["MODEL SITE", "An assisted spatial portfolio product combining a live model-facing site with structured planning, revision and builder surfaces.", ["PORTFOLIO BUILDER", "LIVE PREVIEW", "HUMAN CONTROL"]],
    ] as const;

    expected.forEach(([title, summary, labels], index) => {
      const chapter = chapters[index];
      expect(chapter).toHaveAccessibleName(title);
      expect(within(chapter).getByText(summary)).toBeInTheDocument();
      const rendered = within(chapter).getAllByRole("listitem").map((item) => item.textContent);
      expect(rendered).toEqual([...labels]);
      expect(within(chapter).getAllByRole("button", { name: /^VIEW INTERFACE — / })).toHaveLength(2);
    });
  });

  it("publishes a live destination only for independently verified systems", () => {
    // This catches an undeployed system being given a fabricated public call to action.
    render(<App />);
    const showcase = screen.getByRole("region", { name: "Selected studio systems" });
    const live = within(showcase).getAllByRole("link", { name: "OPEN LIVE SITE ↗" });
    expect(live.map((link) => link.getAttribute("href"))).toEqual([
      "https://brenychstudio.com/immersive/webhero",
      "https://photo.brenychstudio.com",
      "https://brenych-artist-stage.brenychinfo.workers.dev/",
    ]);
    live.forEach((link) => {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    const modelSite = within(showcase).getAllByRole("article")[3];
    expect(within(modelSite).queryByRole("link", { name: "OPEN LIVE SITE ↗" })).not.toBeInTheDocument();
    expect(within(modelSite).getAllByRole("button", { name: /^VIEW INTERFACE — / })).toHaveLength(2);
  });

  it("presents every showcase screenshot complete and scroll-linked in full colour", () => {
    // This catches showcase evidence being cropped to a decorative tile or frozen into a still grid.
    render(<App />);
    const showcase = screen.getByRole("region", { name: "Selected studio systems" });
    const images = within(showcase).getAllByRole("img");
    expect(images).toHaveLength(8);
    images.forEach((image) => {
      const width = image.getAttribute("width");
      const height = image.getAttribute("height");
      expect(Number(width)).toBeGreaterThan(0);
      expect(Number(height)).toBeGreaterThan(0);
      expect(image).toHaveAttribute("data-fit", "contain");
      expect(image).toHaveStyle({ aspectRatio: `${width} / ${height}` });
    });
    within(showcase).getAllByRole("article").forEach((chapter) => {
      expect(chapter).toHaveAttribute("data-motion-state", "scroll-linked");
      expect(chapter).toHaveAttribute("data-chapter-mode", "field");
    });
  });

  it("keeps showcase CSS free of cropped or forced-ratio interface evidence", () => {
    // This catches a breakpoint quietly reintroducing cover cropping for interface screenshots.
    expect(showcaseCss).toMatch(/\.showcase-frame img \{[^}]*height: auto;[^}]*object-fit: contain;[^}]*object-position: center/);
    expect(showcaseCss).not.toMatch(/object-fit:\s*cover/);
    expect(showcaseCss).not.toMatch(/aspect-ratio:\s*16\s*\/\s*10/);
  });
});
