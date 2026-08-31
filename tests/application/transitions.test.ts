import { describe, expect, it } from "vitest";

import { createAgentInterface } from "../../src/application/AgentInterface";
import { buildCollaborationBrief } from "../../src/domain/buildCollaborationBrief";
import type { CollaborationBrief, MatchResult } from "../../src/domain/types";
import { buildMatchResult } from "../../src/domain/matchRequirements";
import { createAppStore, useAppStore } from "../../src/state/appStore";
import {
  selectFocusedProjectContext,
  selectHighlightedCapabilityIds,
  selectMissingRequirementIds,
  selectProjectNodeStates,
} from "../../src/state/selectors";
import { createStoreStatePort } from "../../src/state/storeStatePort";

const createApp = () => {
  const state = createStoreStatePort(createAppStore());
  return { state, app: createAgentInterface(state) };
};

describe("semantic application transitions", () => {
  it("gives normalized optional brief fields a canonical identity without delimiter collisions", () => {
    // This catches IDs built from unnormalized delimiter-separated strings rather than an injective tuple.
    const match = buildMatchResult(["Electron"]);
    const omitted = buildCollaborationBrief({ projectType: "Desktop", requirements: ["Electron"] }, match, "manual");
    const explicitEmpty = buildCollaborationBrief({ projectType: "Desktop", requirements: ["Electron"], context: "", timeline: "", budget: "" }, match, "manual");
    const whitespace = buildCollaborationBrief({ projectType: "Desktop", requirements: ["Electron"], context: "  ", timeline: "\t", budget: "\n" }, match, "manual");
    const left = buildCollaborationBrief({ projectType: "A|B", requirements: ["Electron"], context: "C" }, match, "manual");
    const right = buildCollaborationBrief({ projectType: "A", requirements: ["Electron"], context: "B|C" }, match, "manual");

    expect(omitted).toMatchObject({ context: "", timeline: "", budget: "" });
    expect(explicitEmpty.id).toBe(omitted.id);
    expect(whitespace).toEqual(omitted);
    expect(left.id).not.toBe(right.id);
  });

  it("keeps draft IDs distinct for requirements that collide under 32-bit FNV", () => {
    // This catches draft identity retaining a duplicated eight-hex-digit hash helper.
    const firstRequirement = "uzo3s02uk67hesp3";
    const secondRequirement = "u021egu4rde6a9n0";
    const firstMatch = buildMatchResult([firstRequirement]);
    const secondMatch = buildMatchResult([secondRequirement]);
    const first = buildCollaborationBrief(
      { projectType: "Collision regression", requirements: [firstRequirement] },
      firstMatch,
      "manual",
    );
    const second = buildCollaborationBrief(
      { projectType: "Collision regression", requirements: [secondRequirement] },
      secondMatch,
      "manual",
    );

    expect(first.id).not.toBe(second.id);
    expect(first.id).toMatch(/^brief-[0-9a-f]{16,}$/);
    expect(second.id).toMatch(/^brief-[0-9a-f]{16,}$/);
  });

  it("freezes actual singleton and isolated Zustand state without freezing caller input", () => {
    // This catches immutable port snapshots masking the mutable state observed directly by React subscribers.
    const stores = [createAppStore(), useAppStore];

    for (const store of stores) {
      store.getState().apply({ type: "semantic_reset", provenance: "manual" });
      const initial = store.getState();
      expect(Object.isFrozen(initial)).toBe(true);
      expect(Object.isFrozen(initial.modeHistory)).toBe(true);
      expect(Object.isFrozen(initial.requirements)).toBe(true);

      const callerRequirements = ["Electron"];
      store.getState().apply({
        type: "match_evaluated",
        match: buildMatchResult(callerRequirements),
        requirements: callerRequirements,
        provenance: "manual",
      });
      callerRequirements.push("Swift");
      const matched = store.getState();
      expect(Object.isFrozen(matched)).toBe(true);
      expect(Object.isFrozen(matched.requirements)).toBe(true);
      expect(Object.isFrozen(matched.currentAgentAction)).toBe(true);
      expect(matched.requirements).toEqual(["Electron"]);
      expect(Object.isFrozen(callerRequirements)).toBe(false);
      expect(() => (matched.requirements as string[]).push("Corrupt")).toThrow();

      matched.apply({ type: "match_cleared", provenance: "manual" });
      expect(store.getState()).toMatchObject({ activeMode: "field", matchResult: null });
      expect(Object.isFrozen(store.getState())).toBe(true);
    }
  });

  it("starts with explicit null semantic facts and idle registration", () => {
    // This catches ambiguous undefined state before WebMCP detection begins.
    const { state } = createApp();

    expect(state.snapshot()).toMatchObject({
      registrationState: "idle",
      matchResult: null,
      focusedProjectId: null,
      collaborationDraft: null,
      currentAgentAction: null,
    });
  });

  it("keeps integration registration neutral instead of presenting it as an agent tool action", () => {
    const { app, state } = createApp();

    app.setRegistrationState({ webMcpAvailable: true, registrationState: "ready" }, "webmcp");
    expect(state.snapshot().currentAgentAction).toBeNull();

    app.matchRequirements({ requirements: ["Electron"] }, "manual");
    const action = state.snapshot().currentAgentAction;
    app.setRegistrationState({ webMcpAvailable: true, registrationState: "ready" }, "webmcp");
    expect(state.snapshot().currentAgentAction).toEqual(action);
  });

  it("returns through the exact inspect and brief history", () => {
    // This catches a close transition that always returns to match or field instead of the true prior mode.
    const { app, state } = createApp();
    app.matchRequirements({ requirements: ["Electron"] }, "manual");
    app.focusProject({ projectId: "bdb" }, "manual");
    app.createCollaborationBrief({
      projectType: "Desktop evidence workspace",
      requirements: ["Electron"],
      context: "A local brief.",
      timeline: "Two weeks",
      budget: "Fixed scope",
    }, "manual");

    expect(state.snapshot().activeMode).toBe("brief");
    app.close("manual");
    expect(state.snapshot()).toMatchObject({ activeMode: "inspect", focusedProjectId: "bdb" });
    app.close("manual");
    expect(state.snapshot().activeMode).toBe("match");
  });

  it("inspects a known project without inventing a requirement reason", () => {
    // This catches a focus operation that fabricates matching explanations without a MatchResult.
    const { app, state } = createApp();

    const dossier = app.focusProject({ projectId: "bdb" }, "webmcp");

    expect(dossier.id).toBe("bdb");
    expect(state.snapshot()).toMatchObject({ activeMode: "inspect", focusedProjectId: "bdb" });
    expect(selectFocusedProjectContext(state.snapshot())).toEqual(
      expect.objectContaining({ reason: "Selected BDB; no active requirement evaluation." }),
    );
  });

  it("does not add nested history when focus changes inside inspect", () => {
    // This catches repeated focus requiring two close actions to return to the match workspace.
    const { app, state } = createApp();
    app.matchRequirements({ requirements: ["Electron"] }, "manual");
    app.focusProject({ projectId: "bdb" }, "manual");
    app.focusProject({ projectId: "storyform" }, "manual");

    app.close("manual");
    expect(state.snapshot()).toMatchObject({ activeMode: "match", focusedProjectId: "storyform" });
  });

  it("replaces a repeated brief without a nested brief history entry", () => {
    // This catches creating a brief from brief mode forcing a redundant close back to another brief.
    const { app, state } = createApp();
    app.matchRequirements({ requirements: ["Electron"] }, "manual");
    app.createCollaborationBrief({ projectType: "First brief", requirements: ["Electron"] }, "manual");
    app.createCollaborationBrief({ projectType: "Replacement brief", requirements: ["Electron"] }, "manual");

    app.close("manual");
    expect(state.snapshot()).toMatchObject({ activeMode: "match", collaborationDraft: expect.objectContaining({ projectType: "Replacement brief" }) });
  });

  it("creates a direct brief over its newly evaluated match workspace", () => {
    // This catches the atomic direct-brief path returning straight to field and hiding its fresh match.
    const { app, state } = createApp();
    const brief = app.createCollaborationBrief({ projectType: "Desktop workspace", requirements: ["Electron"] }, "manual");

    expect(brief).toMatchObject({ context: "", timeline: "", budget: "" });
    app.close("manual");
    expect(state.snapshot().activeMode).toBe("match");
    app.close("manual");
    expect(state.snapshot().activeMode).toBe("field");
  });

  it("derives highlights, missing markers, and node positions from semantic facts", () => {
    // This catches derived presentation state becoming stale after a new match.
    const { app, state } = createApp();
    app.matchRequirements({ requirements: ["Electron", "Swift"] }, "manual");

    expect(selectHighlightedCapabilityIds(state.snapshot())).toContain("electron");
    expect(selectMissingRequirementIds(state.snapshot())).toEqual(["swift"]);
    const nodeStates = selectProjectNodeStates(state.snapshot());
    expect(nodeStates).toContainEqual(
      expect.objectContaining({ projectId: "bdb", rank: 1, matchState: "matched" }),
    );
    expect(nodeStates.find((node) => node.projectId === "bdb")).toMatchObject({ spatialTier: "dominant", transform: { z: 36, scale: 1.12 } });
    expect(nodeStates.find((node) => node.projectId === "presence-os-memory-atlas")).toMatchObject({ spatialTier: "receded", transform: { z: -88, scale: 0.8 } });
  });

  it("refreshes a stale match atomically before creating a brief and keeps edits local", () => {
    // This catches briefs retaining a source MatchResult for different requirements or replacing the draft on edit.
    const { app, state } = createApp();
    const first = app.matchRequirements({ requirements: ["Electron"] }, "manual");
    const beforeEvents = state.getEvents().length;

    const brief = app.createCollaborationBrief({
      projectType: "CRM workspace",
      requirements: ["CRM", "Gmail"],
      context: "Operator communications.",
      timeline: "Three weeks",
      budget: "Discovery budget",
    }, "webmcp");

    expect(brief.sourceMatchId).not.toBe(first.id);
    expect(brief.relevantProjectIds[0]).toBe("sprintcrm");
    expect(brief.knownGaps).toEqual([]);
    expect(state.snapshot()).toMatchObject({
      activeMode: "brief",
      matchResult: expect.objectContaining({ id: brief.sourceMatchId }),
      focusedProjectId: "sprintcrm",
      collaborationDraft: brief,
    });
    expect(state.getEvents()).toHaveLength(beforeEvents + 1);

    const edited = app.updateCollaborationBrief({ context: "Updated local context." }, "manual");
    expect(edited).toMatchObject({ id: brief.id, context: "Updated local context." });
    expect(state.snapshot().collaborationDraft).toEqual(edited);
    app.close("manual");
    expect(state.snapshot().activeMode).toBe("match");
  });

  it("clears user match state and reset preserves registration semantics", () => {
    // This catches clear/reset leaking a prior MatchResult or erasing browser integration status.
    const { app, state } = createApp();
    app.setRegistrationState({ webMcpAvailable: true, registrationState: "ready" }, "webmcp");
    app.matchRequirements({ requirements: ["Electron"] }, "manual");
    app.clearMatch("manual");
    expect(state.snapshot()).toMatchObject({
      activeMode: "field",
      matchResult: null,
      focusedProjectId: null,
      collaborationDraft: null,
    });

    app.matchRequirements({ requirements: ["MCP"] }, "manual");
    app.reset("manual");
    expect(state.snapshot()).toMatchObject({
      activeMode: "field",
      matchResult: null,
      webMcpAvailable: true,
      registrationState: "ready",
    });
  });

  it("rejects an array brief update without changing its snapshot or event history", () => {
    // This catches array values passing object validation and silently applying a draft event.
    const { app, state } = createApp();
    app.createCollaborationBrief({ projectType: "Desktop workspace", requirements: ["Electron"] }, "manual");
    const before = state.snapshot();
    const events = state.getEvents();

    expect(() => app.updateCollaborationBrief([] as unknown as Record<string, never>, "manual")).toThrow("brief update must be an object");
    expect(state.snapshot()).toEqual(before);
    expect(state.getEvents()).toEqual(events);
  });

  it("recomputes a stale brief match before a local update", () => {
    // This catches update reusing an obsolete source MatchResult merely because normalized requirements match.
    const { app, state } = createApp();
    const fresh = app.createCollaborationBrief({ projectType: "Desktop workspace", requirements: ["Electron"] }, "manual");
    const staleMatch = { ...buildMatchResult(["Electron"]), id: "match-obsolete", dataVersion: "obsolete" } as MatchResult;
    const staleDraft = { ...fresh, sourceMatchId: "match-obsolete" } as CollaborationBrief;
    state.apply({ type: "brief_updated", match: staleMatch, requirements: ["Electron"], brief: staleDraft, provenance: "manual" });
    const eventsBefore = state.getEvents().length;

    const updated = app.updateCollaborationBrief({ context: "Fresh local edit." }, "manual");

    expect(updated.sourceMatchId).not.toBe("match-obsolete");
    expect(state.snapshot().matchResult).toMatchObject({ dataVersion: "2026-08-27", id: updated.sourceMatchId });
    expect(state.getEvents()).toHaveLength(eventsBefore + 1);
  });

  it("keeps snapshots and stored events detached and immutable", () => {
    // This catches callers mutating an input array, snapshot array, or returned event to alter future state.
    const { app, state } = createApp();
    const requirements = ["Electron"];
    app.matchRequirements({ requirements }, "manual");
    requirements[0] = "Swift";
    const snapshot = state.snapshot();
    const event = state.getEvents()[0] as Extract<ReturnType<typeof state.getEvents>[number], { requirements: readonly string[] }>;

    expect(snapshot.requirements).toEqual(["Electron"]);
    expect(event).toMatchObject({ requirements: ["Electron"] });
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.requirements)).toBe(true);
    expect(Object.isFrozen(event)).toBe(true);
    expect(() => (snapshot.requirements as string[]).push("Swift")).toThrow();
    expect(() => (event.requirements as string[]).push("Swift")).toThrow();
    expect(state.snapshot().requirements).toEqual(["Electron"]);
    expect(state.getEvents()[0]).toMatchObject({ requirements: ["Electron"] });
  });
});
