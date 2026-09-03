import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";

const goldenRequirements = ["Electron", "MCP", "AI automation", "Supabase"] as const;

const evaluateGoldenMatch = (): void => {
  for (const requirement of goldenRequirements) {
    fireEvent.click(screen.getByRole("button", { name: `Add ${requirement}` }));
  }
  fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));
};

const globalCss = readFileSync("src/styles/global.css", "utf8");
const evidenceFieldCss = readFileSync("src/styles/evidence-field.css", "utf8");

const desktopRules = evidenceFieldCss.slice(0, evidenceFieldCss.indexOf("@media (max-width: 900px)"));
const tabletRule = evidenceFieldCss.match(/@media \(max-width: 900px\)[\s\S]*?(?=@media \(max-width: 620px\))/)?.[0] ?? "";

const rem = (value: string): number => Number.parseFloat(value);

/** The winning value of `property` for `selector`, read straight from the shipped stylesheet. */
const declaration = (css: string, selector: string, property: string): string => {
  const blocks = [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^}]*)\}/g)]
    .filter(([, selectors]) => selectors.split(",").some((one) => one.trim() === selector))
    .map(([, , body]) => body);
  if (blocks.length === 0) throw new Error(`no rule for ${selector}`);

  const values = blocks
    .flatMap((body) => body.split(";"))
    .filter((entry) => entry.split(":")[0]?.trim() === property)
    .map((entry) => entry.slice(entry.indexOf(":") + 1).trim());
  const winner = values.at(-1);
  if (winner === undefined) throw new Error(`no ${property} for ${selector}`);
  return winner;
};

/** `font: [weight] <size>rem/<line-height> …` split into its two numbers. */
const fontMetrics = (shorthand: string): { size: number; leading: number } => {
  const match = shorthand.match(/([\d.]+)rem\/([\d.]+)/);
  if (!match) throw new Error(`unparsable font shorthand: ${shorthand}`);
  return { size: Number.parseFloat(match[1]), leading: Number.parseFloat(match[2]) };
};

/** Height in rem of one single-line text row. */
const lineBox = (shorthand: string): number => {
  const { size, leading } = fontMetrics(shorthand);
  return size * leading;
};

const lineHeight = (shorthand: string): number => fontMetrics(shorthand).leading;

describe("evidence heading clearance", () => {
  afterEach(() => { cleanup(); resetAppForTesting(); });

  it("keeps the desktop capability trace list clear of the whole evidence heading block", () => {
    // This catches the trace rows sliding back up over the CORE EVIDENCE GRAPH metadata and the
    // WEBMCP ACTION provenance line, which is what a fixed offset tuned to a shorter heading did.
    const headingTop = rem(declaration(desktopRules, ".field-heading", "top"));
    const rowGap = rem(declaration(desktopRules, ".field-heading", "gap"));

    const labelRow = lineBox(declaration(globalCss, ".field-label", "font"));
    const bodyFont = declaration(desktopRules, ".field-action", "font");
    const bodyRow = lineBox(bodyFont);
    const boundarySize = rem(declaration(desktopRules, ".field-media-boundary", "font-size"));
    const boundaryRow = boundarySize * lineHeight(bodyFont);

    // label+count share the first grid row; state, action and the media boundary each take one.
    const headingRows = [Math.max(labelRow, bodyRow), bodyRow, bodyRow, boundaryRow];
    const headingBottom = headingTop + headingRows.reduce((total, row) => total + row, 0) + rowGap * (headingRows.length - 1);

    const traceTop = rem(declaration(desktopRules, ".capability-trace-list", "top"));

    // Chrome measures the rendered block bottom at 4.67rem against this 4.61rem line-box model.
    expect(traceTop).toBeGreaterThan(headingBottom);
    // A real gap, not a hairline: the boundary line must read as finished before the traces start.
    expect(traceTop - headingBottom).toBeGreaterThanOrEqual(0.5);
    // And still anchored to the heading rather than drifting down into the graph.
    expect(traceTop).toBeLessThanOrEqual(6);
  });

  it("renders exactly the five heading elements the four-row clearance model assumes", () => {
    // This catches a new heading line making the offset above too small again without failing a test.
    render(<App />);
    evaluateGoldenMatch();

    const heading = document.querySelector(".field-heading");
    expect(heading?.children).toHaveLength(5);
    expect([...(heading?.children ?? [])].map((child) => child.className)).toEqual([
      "field-label",
      "field-count",
      "field-state",
      "field-action",
      "field-media-boundary",
    ]);
  });

  it("still lets the trace list fall into normal flow below the tablet breakpoint", () => {
    // This catches the desktop offset leaking into the stacked layout, where it would strand the list.
    expect(tabletRule).toMatch(/\.capability-trace-list \{[^}]*position: static/);
    expect(tabletRule).not.toMatch(/\.capability-trace-list \{[^}]*top:/);
  });

  it("shows every evaluated trace row with its requirement, capability and project intact", () => {
    // This catches a layout fix that clears the heading by clipping or truncating the trace rows.
    render(<App />);
    evaluateGoldenMatch();

    const connections = screen.getByRole("region", { name: "Evidence connections" });
    const traces = within(connections).getAllByRole("listitem");
    expect(traces).toHaveLength(4);
    expect(connections).toHaveTextContent("Electron → Electron → BDB");
    expect(connections).toHaveTextContent("Supabase → Supabase → Weekfield");
  });
});
