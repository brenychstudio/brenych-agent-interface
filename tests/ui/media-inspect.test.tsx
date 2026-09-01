import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App, resetAppForTesting } from "../../src/app/App";
import { CinematicMediaInspect } from "../../src/components/CinematicMediaInspect";
import { mediaForOwner } from "../../src/presentation/evidenceMedia";

const renderRealApp = () => {
  const root = document.createElement("div");
  root.id = "root";
  document.body.append(root);
  return { root, ...render(<App />, { container: root }) };
};

const setScroll = (x: number, y: number): void => {
  Object.defineProperty(window, "scrollX", { configurable: true, value: x });
  Object.defineProperty(window, "scrollY", { configurable: true, value: y });
};

const bdbMedia = mediaForOwner("bdb");

const detachedViewer = (origin: HTMLElement, liveUrl?: string) => (
  <CinematicMediaInspect
    request={{ title: "BDB", media: bdbMedia, activeId: "bdb-task-control", origin, liveUrl }}
    onClose={() => undefined}
  />
);

const openBdbInspect = () => {
  fireEvent.click(screen.getByRole("button", { name: /Project BDB/ }));
  return screen.getByRole("region", { name: "BDB evidence inspect" });
};

afterEach(() => {
  cleanup();
  resetAppForTesting();
  document.getElementById("root")?.remove();
  document.body.removeAttribute("style");
  document.body.removeAttribute("inert");
  setScroll(0, 0);
  vi.restoreAllMocks();
});

describe("cinematic media inspect", () => {
  it.each([
    {
      caption: "Task Control Center / controlled workflow",
      id: "bdb-task-control",
      alt: "BDB task control center showing a bounded development workflow and reviewed task state.",
      src: "/evidence/bdb/bdb-task-control.webp",
      width: "1529",
      height: "976",
      ratio: "1529 / 976",
    },
    {
      caption: "Workspace management / BAI registered project",
      id: "bdb-workspace",
      alt: "Public-safe crop of the BDB workspace management surface for the Brenych Agent Interface project.",
      src: "/evidence/bdb/bdb-workspace.webp",
      width: "954",
      height: "870",
      ratio: "954 / 870",
    },
  ])("opens BDB $id from its exact shared media trigger", async ({ caption, id, alt, src, width, height, ratio }) => {
    // This catches a launcher selecting the wrong registry item, losing contain geometry, or mounting inside #root.
    const { root } = renderRealApp();
    const inspect = openBdbInspect();
    const trigger = within(inspect).getByRole("button", { name: `VIEW FULL INTERFACE ↗ — ${caption}` });

    expect(trigger).toHaveAttribute("data-layout-id", `media-inspect-${id}`);
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "BDB" });
    const image = within(dialog).getByRole("img", { name: alt });
    expect(root).not.toContainElement(dialog);
    expect(document.body).toContainElement(dialog);
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleDescription(caption);
    expect(image).toHaveAttribute("src", src);
    expect(image).toHaveAttribute("width", width);
    expect(image).toHaveAttribute("height", height);
    expect(image).toHaveAttribute("loading", "eager");
    expect(image).toHaveAttribute("decoding", "async");
    expect(image).toHaveAttribute("data-fit", "contain");
    expect(image).toHaveStyle({ aspectRatio: ratio });
    expect(image.closest("[data-layout-id]"))?.toHaveAttribute("data-layout-id", `media-inspect-${id}`);

    fireEvent.click(within(dialog).getByRole("button", { name: "Close media viewer" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "BDB" })).not.toBeInTheDocument());
  });

  it("keeps showcase navigation inside the selected system and wraps in both directions", async () => {
    // This catches showcase media crossing owner collections or navigation failing at either cyclic boundary.
    renderRealApp();
    const proof = screen.getByRole("article", { name: "WEBHERO" });
    const primary = within(proof).getByRole("button", { name: "VIEW INTERFACE — WEBHERO / Interfaces as living environments" });
    const secondary = within(proof).getByRole("button", { name: "VIEW INTERFACE — WEBHERO / Metamorph Bubbles / WebGL object proof" });
    expect(primary).toHaveAttribute("data-layout-id", "media-inspect-webhero-living-environments");
    expect(secondary).toHaveAttribute("data-layout-id", "media-inspect-webhero-metamorph-bubbles");

    fireEvent.click(secondary);
    const dialog = screen.getByRole("dialog", { name: "WEBHERO" });
    expect(within(dialog).getByText("2 / 2")).toBeInTheDocument();
    expect(within(dialog).getByText("Metamorph Bubbles / WebGL object proof")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(within(dialog).getByText("Interfaces as living environments")).toBeInTheDocument();
    expect(within(dialog).getByText("1 / 2")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Previous media" }));
    expect(within(dialog).getByText("Metamorph Bubbles / WebGL object proof")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Next media" }));
    expect(within(dialog).getByText("Interfaces as living environments")).toBeInTheDocument();
  });

  it("gives Escape to the viewer before the underlying Inspect surface", async () => {
    // This catches both document listeners consuming the first Escape and closing two stacked surfaces.
    renderRealApp();
    const inspect = openBdbInspect();
    const trigger = within(inspect).getByRole("button", { name: /VIEW FULL INTERFACE.*Task Control Center/ });
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "BDB" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "BDB" })).not.toBeInTheDocument());
    expect(screen.getByRole("region", { name: "BDB evidence inspect" })).toBeInTheDocument();
    expect(trigger).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("region", { name: "BDB evidence inspect" })).not.toBeInTheDocument();
  });

  it("omits collection controls for a one-item project", () => {
    // This catches a singleton collection exposing misleading controls or changing on arrow keys.
    renderRealApp();
    fireEvent.click(screen.getByRole("button", { name: /Project StoryForm/ }));
    const inspect = screen.getByRole("region", { name: "StoryForm evidence inspect" });
    fireEvent.click(within(inspect).getByRole("button", { name: /VIEW FULL INTERFACE/ }));
    const dialog = screen.getByRole("dialog", { name: "StoryForm" });
    expect(within(dialog).queryByRole("button", { name: "Previous media" })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "Next media" })).not.toBeInTheDocument();
    expect(within(dialog).getByText("1 / 1")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "ArrowLeft" });
    expect(within(dialog).getByText("Storyboard + AI workflow + editing surface")).toBeInTheDocument();
  });

  it("keeps Tab and Shift+Tab inside the viewer and pulls escaped focus back", () => {
    // This catches a modal viewer that lets keyboard users reach the inert page behind it.
    renderRealApp();
    const inspect = openBdbInspect();
    fireEvent.click(within(inspect).getByRole("button", { name: /VIEW FULL INTERFACE.*Task Control Center/ }));
    const dialog = screen.getByRole("dialog", { name: "BDB" });
    const close = within(dialog).getByRole("button", { name: "Close media viewer" });
    expect(close).toHaveFocus();

    const controls = [...dialog.querySelectorAll<HTMLElement>("a[href], button")];
    const first = controls[0];
    const last = controls[controls.length - 1];
    expect(controls.length).toBeGreaterThan(1);

    last.focus();
    fireEvent.keyDown(last, { key: "Tab" });
    expect(first).toHaveFocus();

    first.focus();
    fireEvent.keyDown(first, { key: "Tab", shiftKey: true });
    expect(last).toHaveFocus();

    within(inspect).getByRole("button", { name: "BACK TO EVIDENCE" }).focus();
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("inerts the application root and locks body scroll only for the viewer session", async () => {
    // This catches a viewer that leaves the page scrollable behind it or never releases the lock.
    const { root } = renderRealApp();
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    setScroll(12, 340);
    expect(root).not.toHaveAttribute("inert");

    const inspect = openBdbInspect();
    const trigger = within(inspect).getByRole("button", { name: /VIEW FULL INTERFACE.*Task Control Center/ });
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "BDB" });

    expect(root).toHaveAttribute("inert");
    expect(root).not.toContainElement(dialog);
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.top).toBe("-340px");
    expect(document.body.style.left).toBe("-12px");

    fireEvent.click(within(dialog).getByRole("button", { name: "Close media viewer" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "BDB" })).not.toBeInTheDocument());

    expect(root).not.toHaveAttribute("inert");
    expect(document.body.hasAttribute("style")).toBe(false);
    expect(scrollTo).toHaveBeenCalledWith({ left: 12, top: 340, behavior: "instant" });
    expect(trigger).toHaveFocus();
  });

  it("restores pre-existing root inert and body styles exactly", async () => {
    // This catches blanket cleanup that erases page state the viewer never owned.
    const { root } = renderRealApp();
    root.setAttribute("inert", "");
    document.body.style.overflow = "auto";
    document.body.style.paddingRight = "7px";

    const inspect = openBdbInspect();
    fireEvent.click(within(inspect).getByRole("button", { name: /VIEW FULL INTERFACE.*Workspace management/ }));
    const dialog = screen.getByRole("dialog", { name: "BDB" });
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.click(within(dialog).getByRole("button", { name: "Close media viewer" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "BDB" })).not.toBeInTheDocument());

    expect(root).toHaveAttribute("inert");
    expect(document.body.style.overflow).toBe("auto");
    expect(document.body.style.paddingRight).toBe("7px");
    expect(document.body.style.position).toBe("");
    expect(document.body.style.top).toBe("");
  });

  it("marks the single App-owned Motion layout group", () => {
    // This catches the field, foreground, showcase, and portal controller losing their shared layout namespace.
    const { root } = renderRealApp();
    expect(root.querySelectorAll('[data-layout-group="media-inspect"]')).toHaveLength(1);
  });
});

describe("media viewer lifecycle contract", () => {
  it("releases page state and origin focus when the viewer unmounts without Close", () => {
    // This catches lifecycle cleanup that only runs on the Close button path.
    const origin = document.createElement("button");
    document.body.append(origin);
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    setScroll(0, 220);

    const { unmount } = render(detachedViewer(origin));
    expect(screen.getByRole("dialog", { name: "BDB" })).toBeInTheDocument();
    expect(document.body.style.position).toBe("fixed");

    unmount();

    expect(document.body.hasAttribute("style")).toBe(false);
    expect(scrollTo).toHaveBeenCalledWith({ left: 0, top: 220, behavior: "instant" });
    expect(origin).toHaveFocus();
    origin.remove();
  });

  it("does not throw or steal focus when the origin left the document", () => {
    // This catches focus restoration crashing after the launching surface was replaced.
    const origin = document.createElement("button");
    const { unmount } = render(detachedViewer(origin));
    expect(screen.getByRole("dialog", { name: "BDB" })).toBeInTheDocument();

    expect(() => unmount()).not.toThrow();
    expect(document.activeElement).toBe(document.body);
  });

  it("renders a continuation link only for a collection with a verified destination", () => {
    // This catches an invented live link on evidence that has no verified public destination.
    const origin = document.createElement("button");
    document.body.append(origin);
    const { rerender } = render(detachedViewer(origin));
    expect(screen.queryByRole("link", { name: /OPEN LIVE SITE/ })).not.toBeInTheDocument();

    rerender(detachedViewer(origin, "https://brenychstudio.com/immersive/webhero"));
    const link = screen.getByRole("link", { name: "OPEN LIVE SITE ↗" });
    expect(link).toHaveAttribute("href", "https://brenychstudio.com/immersive/webhero");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    origin.remove();
  });
});
