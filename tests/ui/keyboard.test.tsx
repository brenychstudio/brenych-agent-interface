import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";

afterEach(() => { cleanup(); resetAppForTesting(); });

describe("keyboard evidence navigation", () => {
  it("keeps project nodes reachable and uses Enter, Space, and Escape for reversible inspection", () => {
    // This catches project buttons relying solely on pointer clicks or an exit that drops keyboard focus.
    render(<App />);
    const node = screen.getByRole("button", { name: /Project BDB/ });

    node.focus();
    expect(node).toHaveFocus();
    fireEvent.keyDown(node, { key: "Enter" });
    expect(screen.getByRole("heading", { name: "BDB", level: 2 })).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(node).toHaveFocus();

    fireEvent.keyDown(node, { key: " " });
    expect(screen.getByRole("heading", { name: "BDB", level: 2 })).toHaveFocus();
    expect(node).toHaveAccessibleName("Project BDB, field, not evaluated, inspect selected");
    expect(screen.getByRole("status")).toHaveTextContent("Manual action: Project selected.");
  });
});
