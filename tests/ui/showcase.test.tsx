import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";

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
});
