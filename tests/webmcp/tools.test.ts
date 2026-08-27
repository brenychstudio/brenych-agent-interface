import { describe, expect, it } from "vitest";

import { createAgentInterface } from "../../src/application/AgentInterface";
import { INPUT_LIMITS } from "../../src/domain/limits";
import { createAppStore } from "../../src/state/appStore";
import { createStoreStatePort } from "../../src/state/storeStatePort";
import { createToolDefinitions } from "../../src/webmcp/toolDefinitions";
import type { ToolResult } from "../../src/webmcp/toolResults";

const createDefinitions = () => createToolDefinitions(createAgentInterface(createStoreStatePort(createAppStore())));

describe("WebMCP tool definitions", () => {
  it("publishes only the seven public-safe tool names", () => {
    // This catches adding an unsafe transport tool or omitting a supported facade capability.
    expect(createDefinitions().map((tool) => tool.name).sort()).toEqual([
      "create_collaboration_brief",
      "focus_project",
      "get_capabilities",
      "get_profile",
      "get_project",
      "list_projects",
      "match_requirements",
    ]);
  });

  it("publishes bounded closed input schemas", () => {
    // This catches a schema accepting unbounded or unrecognised arguments before runtime validation runs.
    const byName = Object.fromEntries(createDefinitions().map((tool) => [tool.name, tool]));
    const capabilitySchema = byName.get_capabilities.inputSchema as Record<string, unknown>;
    const projectsSchema = byName.list_projects.inputSchema as Record<string, unknown>;
    const projectSchema = byName.get_project.inputSchema as Record<string, unknown>;
    const matchSchema = byName.match_requirements.inputSchema as Record<string, unknown>;
    const briefSchema = byName.create_collaboration_brief.inputSchema as Record<string, unknown>;

    expect(capabilitySchema).toMatchObject({ type: "object", additionalProperties: false, properties: { query: { maxLength: INPUT_LIMITS.queryLength }, limit: { maximum: INPUT_LIMITS.capabilityLimit } } });
    expect(projectsSchema).toMatchObject({ type: "object", additionalProperties: false, properties: { query: { maxLength: INPUT_LIMITS.queryLength }, limit: { maximum: INPUT_LIMITS.projectLimit } } });
    expect(projectSchema).toMatchObject({ type: "object", additionalProperties: false, required: ["projectId"], properties: { projectId: { enum: ["bdb", "distribution-desk", "weekfield", "sprintcrm", "storyform", "native-site-control", "presence-os-memory-atlas"] } } });
    expect(matchSchema).toMatchObject({ type: "object", additionalProperties: false, required: ["requirements"], properties: { requirements: { minItems: 1, maxItems: INPUT_LIMITS.requirementCount, items: { minLength: 1, maxLength: INPUT_LIMITS.requirementLength } } } });
    expect(briefSchema).toMatchObject({ type: "object", additionalProperties: false, required: ["projectType", "requirements"], properties: { projectType: { minLength: 1, maxLength: INPUT_LIMITS.projectTypeLength }, context: { maxLength: INPUT_LIMITS.contextLength }, timeline: { maxLength: INPUT_LIMITS.timelineLength }, budget: { maxLength: INPUT_LIMITS.budgetLength } } });
  });

  it("uses portable non-whitespace patterns that accept ASCII and non-Latin input", () => {
    // This catches a schema pattern whose behavior changes when a WebMCP validator constructs it without Unicode flags.
    const byName = Object.fromEntries(createDefinitions().map((tool) => [tool.name, tool]));
    const matchSchema = byName.match_requirements.inputSchema as { properties: { requirements: { items: Record<string, unknown> } } };
    const briefSchema = byName.create_collaboration_brief.inputSchema as { properties: { projectType: Record<string, unknown>; requirements: { items: Record<string, unknown> } } };
    const requirementPattern = new RegExp(matchSchema.properties.requirements.items.pattern as string);
    const briefRequirementPattern = new RegExp(briefSchema.properties.requirements.items.pattern as string);
    const projectTypePattern = new RegExp(briefSchema.properties.projectType.pattern as string);

    for (const pattern of [requirementPattern, briefRequirementPattern, projectTypePattern]) {
      expect(pattern.test("   ")).toBe(false);
      expect(pattern.test("\t")).toBe(false);
      expect(pattern.test("\n")).toBe(false);
      expect(pattern.test("p")).toBe(true);
      expect(pattern.test("Electron")).toBe(true);
      expect(pattern.test("\u65e5\u672c\u8a9e")).toBe(true);
    }
  });

  it("keeps list summaries compact while get_project returns a public evidence dossier", async () => {
    // This catches reusing the list serializer for get_project and dropping evidence provenance from the dossier.
    const byName = Object.fromEntries(createDefinitions().map((tool) => [tool.name, tool]));
    const signal = new AbortController().signal;
    const listResult = (await byName.list_projects.execute({ query: "SprintCRM" }, { signal })) as ToolResult;
    const dossierResult = (await byName.get_project.execute({ projectId: "sprintcrm" }, { signal })) as ToolResult;

    expect(listResult).toMatchObject({ ok: true });
    expect(dossierResult).toMatchObject({ ok: true });
    if (!listResult.ok || !dossierResult.ok) throw new Error("expected successful read-only tool results");

    const summaries = listResult.data.projects as readonly Record<string, unknown>[];
    expect(summaries).toHaveLength(1);
    expect(summaries[0]).toMatchObject({
      id: "sprintcrm",
      title: "SprintCRM",
      capabilityIds: ["crm", "gmail-communication", "operator-workflow", "supabase"],
    });
    expect(summaries[0]).not.toHaveProperty("evidence");
    expect(summaries[0]).not.toHaveProperty("verificationLevels");

    expect(dossierResult.data).toMatchObject({
      id: "sprintcrm",
      title: "SprintCRM",
      summary: "A CRM interface for operator-led communication workflows.",
      maturity: "public_case",
      visibility: "public",
      verificationLevels: ["verified_remote"],
      capabilities: [
        { id: "crm", label: "CRM", category: "Product workflows" },
        { id: "gmail-communication", label: "Gmail communication", category: "Communication workflows" },
        { id: "operator-workflow", label: "Operator workflow", category: "Product workflows" },
        { id: "supabase", label: "Supabase", category: "Product workflows" },
      ],
      links: [
        { label: "Public case", href: "https://brenychstudio.com/work/sprintcrm", kind: "case_study" },
        { label: "Public repository", href: "https://github.com/brenychstudio/SprintCRM", kind: "repository" },
      ],
      limitations: [
        "Public evidence does not include contact data or customer records.",
        "No delivery or adoption metrics are claimed.",
      ],
    });
    expect(dossierResult.data.evidence).toHaveLength(4);
    expect(dossierResult.data.evidence).toContainEqual({
      id: "sprintcrm-crm",
      claim: "Public case identifies a CRM workspace.",
      visibility: "portfolio_case",
      verificationLevel: "verified_remote",
      sourceLabel: "SprintCRM public case",
      sourceReference: "https://brenychstudio.com/work/sprintcrm",
    });
  });
});
