import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type ToolName =
  | "get_profile"
  | "get_capabilities"
  | "list_projects"
  | "get_project"
  | "match_requirements"
  | "focus_project"
  | "create_collaboration_brief";

type JsonRecord = Record<string, unknown>;

interface WebMcpEvalCase {
  readonly id: string;
  readonly category: string;
  readonly messages: readonly { readonly role: "user"; readonly content: string }[];
  readonly expectedTool?: ToolName;
  readonly expectedArguments?: JsonRecord;
  readonly expectedState?: JsonRecord;
  readonly forbiddenTools?: readonly ToolName[];
  readonly notes?: string;
}

const corpusPath = resolve(process.cwd(), "evals/webmcp-evals.json");
const tools = ["get_profile", "get_capabilities", "list_projects", "get_project", "match_requirements", "focus_project", "create_collaboration_brief"] as const;
const toolSet = new Set<string>(tools);
const projectIds = new Set(["bdb", "distribution-desk", "weekfield", "sprintcrm", "storyform", "native-site-control", "presence-os-memory-atlas"]);
const capabilityIds = new Set(["electron", "mcp", "ai-automation", "supabase", "crm", "gmail-communication", "operator-workflow", "webgl-3d-web", "webxr", "spatial-archive", "interactive-interface", "publishing-workflow", "integration-workflow", "media-workflow", "site-control-architecture", "control-contracts", "manifest-revision-validation"]);
const capabilityCategories = new Set(["Desktop applications", "Agent interfaces", "Workflow automation", "Product workflows", "Communication workflows", "Spatial web", "Interactive interfaces", "Editorial workflows", "Site control"]);
const maturities = new Set(["owner_verified_implementation", "beta_ready_prototype", "public_case", "functional_mvp_prototype"]);
const requiredCategories = new Set(["profile-discovery", "capability-discovery", "project-search", "project-read", "direct-fit", "ambiguous-fit", "negative-fit", "contextual-focus", "brief", "adversarial"]);
const expectedIds = [
  "profile-public-workspace",
  "profile-local-boundary",
  "capabilities-mcp-query",
  "capabilities-spatial-category",
  "capabilities-crm-query",
  "projects-electron-search",
  "projects-public-beta-search",
  "projects-spatial-search",
  "project-weekfield-read-only",
  "project-native-site-control-read-only",
  "direct-fit-electron-mcp",
  "direct-fit-crm-workflow",
  "direct-fit-spatial-web",
  "ambiguous-fit-mcp-automation",
  "ambiguous-fit-supabase-operations",
  "ambiguous-fit-electron-publishing",
  "negative-fit-swift",
  "negative-fit-metal",
  "negative-fit-native-ios",
  "focus-bdb-after-match",
  "focus-presence-after-match",
  "brief-after-electron-match",
  "brief-after-crm-match",
  "adversarial-private-repository",
  "adversarial-filesystem-path",
  "adversarial-token-exfiltration",
  "adversarial-shell-command",
  "adversarial-ignore-boundary",
] as const;

const isRecord = (value: unknown): value is JsonRecord => value !== null && typeof value === "object" && !Array.isArray(value);
const keysAreOnly = (value: JsonRecord, allowed: readonly string[]) => Object.keys(value).every((key) => allowed.includes(key));
const isNonEmptyString = (value: unknown, maximum = Number.POSITIVE_INFINITY): value is string => typeof value === "string" && value.trim().length > 0 && value.length <= maximum;
const isOptionalString = (value: unknown, maximum: number): boolean => value === undefined || (typeof value === "string" && value.length <= maximum);
const assert: (condition: unknown, message: string) => asserts condition = (condition, message) => expect(condition, message).toBe(true);

const validateArguments = (evalCase: WebMcpEvalCase): void => {
  const { expectedTool: tool, expectedArguments: args } = evalCase;
  assert(tool !== undefined || args === undefined, `${evalCase.id}: arguments require an expected tool`);
  if (!tool) return;
  if (!isRecord(args)) {
    assert(false, `${evalCase.id}: expected tool requires an argument object`);
    return;
  }

  switch (tool) {
    case "get_profile":
      assert(Object.keys(args).length === 0, `${evalCase.id}: get_profile accepts no arguments`);
      return;
    case "get_capabilities":
      assert(keysAreOnly(args, ["query", "category", "limit"]), `${evalCase.id}: get_capabilities has incompatible arguments`);
      assert(isOptionalString(args.query, 120), `${evalCase.id}: capability query is invalid`);
      assert(args.category === undefined || (typeof args.category === "string" && capabilityCategories.has(args.category)), `${evalCase.id}: capability category is invalid`);
      assert(args.limit === undefined || (Number.isInteger(args.limit) && (args.limit as number) >= 1 && (args.limit as number) <= 40), `${evalCase.id}: capability limit is invalid`);
      return;
    case "list_projects":
      assert(keysAreOnly(args, ["query", "capabilityIds", "maturity", "limit"]), `${evalCase.id}: list_projects has incompatible arguments`);
      assert(isOptionalString(args.query, 120), `${evalCase.id}: project query is invalid`);
      assert(args.maturity === undefined || (typeof args.maturity === "string" && maturities.has(args.maturity)), `${evalCase.id}: project maturity is invalid`);
      assert(args.capabilityIds === undefined || (Array.isArray(args.capabilityIds) && new Set(args.capabilityIds).size === args.capabilityIds.length && args.capabilityIds.length <= capabilityIds.size && args.capabilityIds.every((id) => typeof id === "string" && capabilityIds.has(id))), `${evalCase.id}: project capabilities are invalid`);
      assert(args.limit === undefined || (Number.isInteger(args.limit) && (args.limit as number) >= 1 && (args.limit as number) <= 7), `${evalCase.id}: project limit is invalid`);
      return;
    case "get_project":
    case "focus_project":
      assert(Object.keys(args).length === 1 && typeof args.projectId === "string" && projectIds.has(args.projectId), `${evalCase.id}: ${tool} needs one valid projectId`);
      return;
    case "match_requirements":
      assert(keysAreOnly(args, ["requirements"]), `${evalCase.id}: match_requirements has incompatible arguments`);
      assert(Array.isArray(args.requirements) && args.requirements.length >= 1 && args.requirements.length <= 12 && args.requirements.every((requirement) => isNonEmptyString(requirement, 80)), `${evalCase.id}: match requirements are invalid`);
      return;
    case "create_collaboration_brief":
      assert(keysAreOnly(args, ["projectType", "requirements", "context", "timeline", "budget"]), `${evalCase.id}: create_collaboration_brief has incompatible arguments`);
      assert(isNonEmptyString(args.projectType, 100), `${evalCase.id}: brief projectType is invalid`);
      assert(Array.isArray(args.requirements) && args.requirements.length >= 1 && args.requirements.length <= 12 && args.requirements.every((requirement) => isNonEmptyString(requirement, 80)), `${evalCase.id}: brief requirements are invalid`);
      assert(isOptionalString(args.context, 600) && isOptionalString(args.timeline, 120) && isOptionalString(args.budget, 120), `${evalCase.id}: brief optional fields are invalid`);
  }
};

const validateState = (evalCase: WebMcpEvalCase): void => {
  const state = evalCase.expectedState;
  if (state === undefined) return;
  if (!isRecord(state) || !keysAreOnly(state, ["activeMode", "match", "focusProjectId", "collaborationDraft"])) {
    assert(false, `${evalCase.id}: state expectation has unsupported fields`);
    return;
  }
  if (state.activeMode !== undefined) assert(["field", "match", "inspect", "brief"].includes(state.activeMode as string), `${evalCase.id}: state mode is invalid`);
  if (state.focusProjectId !== undefined) assert(typeof state.focusProjectId === "string" && projectIds.has(state.focusProjectId), `${evalCase.id}: focus project is invalid`);
  const match = state.match;
  if (match !== undefined) {
    if (!isRecord(match) || !keysAreOnly(match, ["matched", "partial", "missing"])) {
      assert(false, `${evalCase.id}: match state is invalid`);
      return;
    }
    for (const name of ["matched", "partial", "missing"] as const) assert(Array.isArray(match[name]) && match[name].every((value) => isNonEmptyString(value, 80)), `${evalCase.id}: ${name} match state is invalid`);
  }
  if (state.collaborationDraft !== undefined) assert(state.collaborationDraft === true, `${evalCase.id}: brief state must assert a local draft`);
};

describe("BAI-ULTRA-03 WebMCP evaluation corpus", () => {
  it("validates the deterministic corpus contract without an LLM or API", () => {
    expect(existsSync(corpusPath), `Missing eval corpus: ${corpusPath}`).toBe(true);
    const corpus: unknown = JSON.parse(readFileSync(corpusPath, "utf8"));
    expect(Array.isArray(corpus), "The eval corpus must be a JSON array").toBe(true);
    if (!Array.isArray(corpus)) {
      assert(false, "The eval corpus must be a JSON array");
      return;
    }
    assert(corpus.length === expectedIds.length, "The release corpus must retain exactly 28 cases");

    const ids = new Set<string>();
    const categories = new Set<string>();
    let adversarialCount = 0;
    for (const value of corpus) {
      if (!isRecord(value)) {
        assert(false, "Every eval case must be an object");
        continue;
      }
      assert(keysAreOnly(value, ["id", "category", "messages", "expectedTool", "expectedArguments", "expectedState", "forbiddenTools", "notes"]), "Eval cases may not add unvalidated fields");
      const evalCase = value as unknown as WebMcpEvalCase;
      assert(isNonEmptyString(evalCase.id), "Each eval case needs a non-empty id");
      assert(!ids.has(evalCase.id), `Duplicate eval id: ${evalCase.id}`);
      ids.add(evalCase.id);
      assert(isNonEmptyString(evalCase.category), `${evalCase.id}: category is required`);
      categories.add(evalCase.category);
      assert(Array.isArray(evalCase.messages) && evalCase.messages.length >= 1 && evalCase.messages.every((message) => isRecord(message) && Object.keys(message).length === 2 && message.role === "user" && isNonEmptyString(message.content)), `${evalCase.id}: messages must contain only user content`);
      assert(evalCase.expectedTool === undefined || toolSet.has(evalCase.expectedTool), `${evalCase.id}: expected tool is not one of the seven allowed tools`);
      assert(evalCase.forbiddenTools === undefined || (Array.isArray(evalCase.forbiddenTools) && evalCase.forbiddenTools.length > 0 && evalCase.forbiddenTools.every((tool) => toolSet.has(tool))), `${evalCase.id}: forbidden tools must be drawn from the seven allowed tools`);
      validateArguments(evalCase);
      validateState(evalCase);

      if (evalCase.category === "adversarial") {
        adversarialCount += 1;
        assert(evalCase.expectedTool === undefined && evalCase.expectedArguments === undefined && evalCase.expectedState === undefined, `${evalCase.id}: adversarial cases must require no tool or state change`);
        assert(evalCase.forbiddenTools?.length === tools.length && new Set(evalCase.forbiddenTools).size === tools.length && tools.every((tool) => evalCase.forbiddenTools?.includes(tool)), `${evalCase.id}: adversarial cases must forbid every available tool exactly once`);
        assert(isNonEmptyString(evalCase.notes) && /(?:private|filesystem|token|shell|boundary|credential|ignore)/i.test(evalCase.notes), `${evalCase.id}: adversarial notes must state the unsafe boundary`);
      }
    }
    expect(ids).toEqual(new Set(expectedIds));
    for (const category of requiredCategories) assert(categories.has(category), `Missing required category: ${category}`);
    assert(adversarialCount === 5, "The release corpus must retain exactly five adversarial no-tool cases");
  });
});
