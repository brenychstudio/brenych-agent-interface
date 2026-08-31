import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";

const evidenceFieldCss = readFileSync("src/styles/evidence-field.css", "utf8");
const projectNodeSource = readFileSync("src/components/ProjectNode.tsx", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
  readonly dependencies?: Record<string, string>;
};

afterEach(() => { cleanup(); resetAppForTesting(); });

describe("persistent evidence field", () => {
  it("uses neutral node labels before evaluation and after a match is cleared", () => {
    // This catches a field that fabricates ranking or match depth before evidence has been evaluated.
    render(<App />);

    const initialNodes = screen.getAllByRole("button", { name: /Project / });
    expect(initialNodes).toHaveLength(7);
    expect(initialNodes.every((node) => !/rank|foreground|receded/i.test(node.getAttribute("aria-label") ?? ""))).toBe(true);
    expect(initialNodes[0]).toHaveTextContent("FIELD · NOT EVALUATED");

    fireEvent.click(screen.getByRole("button", { name: "Add Electron" }));
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));
    fireEvent.click(screen.getByRole("button", { name: "Clear match" }));

    expect(screen.getAllByRole("button", { name: /Project / }).every((node) => !/rank|foreground|receded/i.test(node.getAttribute("aria-label") ?? ""))).toBe(true);
    expect(screen.getByRole("button", { name: /Project BDB/ })).toHaveTextContent("FIELD · NOT EVALUATED");
  });

  it("keeps desktop dossiers separated and switches to a safe responsive sequence", () => {
    // This catches field nodes that overlap sibling text at desktop or remain absolute through tablet/mobile layouts.
    render(<App />);
    const xPositions = screen.getAllByRole("button", { name: /Project / }).map((node) => node.style.getPropertyValue("--node-x"));
    const yPositions = screen.getAllByRole("button", { name: /Project / }).map((node) => node.style.getPropertyValue("--node-y"));
    const tabletRule = evidenceFieldCss.match(/@media \(max-width: 900px\)[\s\S]*?(?=@media \(max-width: 620px\)|$)/)?.[0] ?? "";
    const mobileRule = evidenceFieldCss.match(/@media \(max-width: 620px\)[\s\S]*/)?.[0] ?? "";

    expect(new Set(xPositions.map((x, index) => `${x}:${yPositions[index]}`)).size).toBe(7);
    expect(xPositions.every((position) => position.endsWith("%"))).toBe(true);
    expect(yPositions.every((position) => position.endsWith("%"))).toBe(true);
    expect(screen.getByRole("button", { name: /Project Presence OS Memory Atlas/ }).style.getPropertyValue("--node-y")).toBe("64%");
    expect(evidenceFieldCss).toMatch(/\.evidence-field \{[\s\S]*min-height: 74rem;[\s\S]*perspective: 850px;/);
    expect(evidenceFieldCss).toMatch(/\.project-node \{[\s\S]*top: calc\(var\(--node-y\) \+ 3rem \+ var\(--field-pan-y, 0px\)\);/);
    expect(evidenceFieldCss).toMatch(/\.project-node \{[\s\S]*width: 29%;/);
    expect(tabletRule).toMatch(/\.evidence-field \{[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);[\s\S]*perspective: none;/);
    expect(tabletRule).toMatch(/\.project-node,[\s\S]*position: relative;[\s\S]*width: 100%;[\s\S]*translate3d\(0, 0, 0\) scale\(1\)/);
    expect(tabletRule).toMatch(/\.project-node,[\s\S]*order: var\(--node-order\)/);
    expect(tabletRule).toMatch(/\.project-node\[data-spatial-tier="dominant"\] \{[^}]*grid-column: 1 \/ -1/);
    expect(mobileRule).toMatch(/\.project-node,[\s\S]*width: 100%;/);
    expect(mobileRule).toMatch(/flex-direction: column;/);
    expect(mobileRule).toMatch(/min-width: 0;/);
    expect(`${tabletRule}${mobileRule}`).toMatch(/transform: translate3d\(0, 0, 0\) scale\(1\);/);
  });

  it("uses Motion for controlled spatial transitions with a reduced-motion fallback", () => {
    // This catches replacing the required Motion-backed 2.5D foundation with CSS-only transitions.
    expect(packageJson.dependencies?.motion).toBeTruthy();
    expect(projectNodeSource).toContain('from "motion/react"');
    expect(projectNodeSource).toContain("useReducedMotion");
    expect(projectNodeSource).toContain("<motion.button");
    expect(projectNodeSource).toContain("initial={false}");
    expect(projectNodeSource).toContain("reduceMotion ? 0 : 0.18");
  });

  it("keeps the longest inspect-background dossier contained without depth projection", () => {
    // This catches the third-row background label escaping the field when its inspect recession is too large.
    const selectedRule = evidenceFieldCss.match(/\.project-node\.is-inspect-selected \{[^}]*\}/)?.[0] ?? "";
    const peerRule = evidenceFieldCss.match(/\.project-node\.is-inspect-receded \{[^}]*\}/)?.[0] ?? "";
    const tabletRule = evidenceFieldCss.match(/@media \(max-width: 900px\)[\s\S]*?(?=@media \(max-width: 620px\)|$)/)?.[0] ?? "";
    const mobileRule = evidenceFieldCss.match(/@media \(max-width: 620px\)[\s\S]*/)?.[0] ?? "";

    expect(selectedRule).toMatch(/opacity: 1 !important/);
    expect(selectedRule).toMatch(/z-index: 80 !important/);
    expect(selectedRule).toMatch(/border-width: 2px/);
    expect(selectedRule).toMatch(/box-shadow:/);
    expect(selectedRule).toMatch(/transform: translate3d\(0, 0, 0\) scale\(1\)/);
    expect(peerRule).toMatch(/opacity: \.18 !important/);
    expect(peerRule).toMatch(/transform: translate3d\(0, 0, 0\) scale\(\.78\)/);
    expect(`${selectedRule}${tabletRule}${mobileRule}`).not.toMatch(/150px|scale\(1\.08\)/);
  });

  it("retains the field element through evaluation while all project nodes remain actionable", () => {
    // This catches a mode-specific field replacement or an interaction model that only exposes leading projects.
    render(<App />);
    const field = screen.getByTestId("evidence-field");

    fireEvent.click(screen.getByRole("button", { name: "Add Electron" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Add a requirement" }), { target: { value: "CoreML" } });
    fireEvent.click(screen.getByRole("button", { name: "Add requirement" }));
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));

    expect(screen.getByTestId("evidence-field")).toBe(field);
    expect(screen.getByRole("region", { name: "NOT DEMONSTRATED" })).toHaveTextContent("CoreML");
    expect(screen.getAllByText("NOT DEMONSTRATED")).not.toHaveLength(0);
    expect(screen.getByRole("button", { name: /BDB.*foreground/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /project.*(BDB|Distribution Desk|Weekfield|SprintCRM|StoryForm|Native Site Control|Presence OS Memory Atlas)/i })).toHaveLength(7);
  });

  it("recedes unmatched nodes when a narrow evaluation has a single leading match", () => {
    // This catches rank-only presentation that wrongly foregrounds a zero-evidence project.
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Add MCP" }));
    fireEvent.click(screen.getByRole("button", { name: "EVALUATE EVIDENCE" }));

    expect(screen.getByRole("button", { name: /Project BDB.*foreground.*matched/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Project Distribution Desk.*receded.*unmatched/i })).toBeInTheDocument();
  });
});
