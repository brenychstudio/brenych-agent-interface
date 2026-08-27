import { describe, expect, it } from "vitest";

import { createAgentInterface } from "../../src/application/AgentInterface";
import { useAppStore } from "../../src/state/appStore";
import { createStoreStatePort } from "../../src/state/storeStatePort";
import { createAppStore } from "../../src/state/appStore";

const createApp = () => {
  const state = createStoreStatePort(createAppStore());
  return { state, app: createAgentInterface(state) };
};

describe("agent application facade", () => {
  it("returns bounded, public-safe query DTOs without a state write", () => {
    // This catches query orchestration leaking into semantic state or returning fixture internals.
    const { app, state } = createApp();

    expect(app.getProfile()).toMatchObject({
      studio: "Brenych Studio",
      location: "Barcelona, Spain",
      publicLinks: [{ href: "https://brenychstudio.com" }],
    });
    expect(app.getCapabilities({ query: "electron", limit: 1 })).toEqual([
      expect.objectContaining({
        id: "electron",
        label: "Electron",
        category: "Desktop applications",
        evidenceCount: 3,
        strongestEvidenceProjectIds: ["bdb", "distribution-desk", "storyform"],
      }),
    ]);
    expect(app.listProjects({ capabilityIds: ["crm"], maturity: "public_case" })).toEqual([
      expect.objectContaining({ id: "sprintcrm", title: "SprintCRM" }),
    ]);
    expect(app.getProject("weekfield")).toMatchObject({
      id: "weekfield",
      title: "Weekfield",
      productType: "Creator operations workspace",
      publicEvidenceName: "CreatorOps",
      links: [{ href: "https://brenychstudio.com/work/creatorops" }],
    });
    expect(state.getEvents()).toEqual([]);
  });

  it("rejects invalid query input before any semantic mutation", () => {
    // This catches a validator that writes an action or partial state before reporting a bad request.
    const { app, state } = createApp();
    const before = state.snapshot();

    expect(() => app.getCapabilities({ query: "x".repeat(121) })).toThrow("query must be at most 120 characters");
    expect(() => app.listProjects({ capabilityIds: ["unknown"] })).toThrow("unknown capability");
    expect(() => app.listProjects({ maturity: "unknown" as never })).toThrow("unknown maturity");
    expect(() => app.getProject("unknown" as never)).toThrow("unknown project");
    expect(state.snapshot()).toEqual(before);
    expect(state.getEvents()).toEqual([]);
  });

  it("commits a complete requirement match in one manual event", () => {
    // This catches split writes or a façade that stores raw input without the evaluated result.
    const { app, state } = createApp();

    const result = app.matchRequirements({ requirements: ["Electron", "MCP"] }, "manual");

    expect(state.snapshot()).toMatchObject({
      activeMode: "match",
      requirements: ["Electron", "MCP"],
      matchResult: result,
      currentAgentAction: {
        source: "manual",
        type: "match_requirements",
      },
    });
    expect(state.getEvents()).toHaveLength(1);
    expect(state.getEvents()[0]).toMatchObject({ type: "match_evaluated", provenance: "manual" });
  });

  it("keeps snapshot and event history unchanged for an invalid match", () => {
    // This catches validation occurring after an event has already changed state.
    const { app, state } = createApp();
    app.matchRequirements({ requirements: ["Electron"] }, "manual");
    const before = state.snapshot();
    const eventsBefore = state.getEvents();

    expect(() => app.matchRequirements({ requirements: [] }, "webmcp")).toThrow(
      "requirements must contain between 1 and 12 requirements",
    );
    expect(state.snapshot()).toEqual(before);
    expect(state.getEvents()).toEqual(eventsBefore);
  });

  it("gives manual and WebMCP callers identical semantic outcomes", () => {
    // This catches transport-specific state transitions for the same façade command.
    const manual = createApp();
    const webmcp = createApp();

    const manualResult = manual.app.matchRequirements({ requirements: ["MCP", "Electron"] }, "manual");
    const webmcpResult = webmcp.app.matchRequirements({ requirements: ["MCP", "Electron"] }, "webmcp");

    expect(webmcpResult).toEqual(manualResult);
    expect({ ...webmcp.state.snapshot(), currentAgentAction: undefined }).toEqual({
      ...manual.state.snapshot(),
      currentAgentAction: undefined,
    });
  });

  it("makes the default façade port observable through the production hook", () => {
    // This catches a default StatePort creating an isolated store that the mounted UI cannot observe.
    const state = createStoreStatePort();
    const app = createAgentInterface(state);
    app.reset("manual");

    app.matchRequirements({ requirements: ["Electron"] }, "manual");

    expect(useAppStore.getState()).toMatchObject({
      activeMode: "match",
      matchResult: expect.objectContaining({ requirements: [expect.objectContaining({ id: "electron" })] }),
    });
    app.reset("manual");
  });

  it("returns frozen, detached public DTOs", () => {
    // This catches a DTO retaining fixture-owned arrays that a caller can corrupt for later queries.
    const { app } = createApp();
    const profile = app.getProfile();
    const capabilities = app.getCapabilities({ limit: 1 });
    const projects = app.listProjects({ limit: 1 });
    const dossier = app.getProject("weekfield");

    expect(Object.isFrozen(profile)).toBe(true);
    expect(Object.isFrozen(capabilities)).toBe(true);
    expect(Object.isFrozen(projects)).toBe(true);
    expect(Object.isFrozen(dossier.links)).toBe(true);
    expect(() => (profile.roles as string[]).push("Corrupt")).toThrow();
    expect(() => (dossier.links as unknown as { href: string }[]).push({ href: "https://invalid.test" })).toThrow();
    expect(app.getProfile().roles).not.toContain("Corrupt");
    expect(app.getProject("weekfield").links).toEqual([{ label: "CreatorOps public case", href: "https://brenychstudio.com/work/creatorops", kind: "case_study" }]);
  });

  it("returns a frozen detached dossier when focus also changes state", () => {
    // This catches focus returning a raw fixture-backed dossier while getProject protects its result boundary.
    const { app, state } = createApp();
    const dossier = app.focusProject({ projectId: "weekfield" }, "manual");

    expect(state.getEvents()).toHaveLength(1);
    expect(Object.isFrozen(dossier)).toBe(true);
    expect(Object.isFrozen(dossier.limitations)).toBe(true);
    expect(() => (dossier.limitations as string[]).push("Corrupt" )).toThrow();
    expect(app.getProject("weekfield").limitations).not.toContain("Corrupt");
  });
});
