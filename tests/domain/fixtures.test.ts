import { describe, expect, it } from "vitest";

import { capabilities } from "../../src/domain/capabilities";
import { evidenceRecords } from "../../src/domain/evidence";
import {
  assertFixtureIntegrity,
  type FixtureGraph,
} from "../../src/domain/fixtureIntegrity";
import { projects } from "../../src/domain/projects";
import type { EvidenceRecord, Project } from "../../src/domain/types";

const currentGraph = (): FixtureGraph => ({ projects, capabilities, evidenceRecords });

const expectIntegrityError = (graph: FixtureGraph, message: string): void => {
  expect(() => assertFixtureIntegrity(graph)).toThrow(message);
};

describe("public evidence fixtures", () => {
  it("exposes the approved project order and fully evidenced capability graph", () => {
    // This catches a changed approved project set, a dangling fixture reference,
    // or a capability that cannot be supported by an evidence record.
    expect(projects.map((project) => project.id)).toEqual([
      "bdb",
      "distribution-desk",
      "weekfield",
      "sprintcrm",
      "storyform",
      "native-site-control",
      "presence-os-memory-atlas",
    ]);
    expect(() =>
      assertFixtureIntegrity({ projects, capabilities, evidenceRecords }),
    ).not.toThrow();
    expect(new Set(evidenceRecords.map((record) => record.capabilityId))).toEqual(
      new Set(capabilities.map((capability) => capability.id)),
    );
  });

  it("keeps summary-only records free of invented public routes", () => {
    const summaryOnlyProjects = projects.filter(
      (project) => project.visibility === "public_summary_only",
    );
    const summaryOnlyIds = new Set(summaryOnlyProjects.map((project) => project.id));

    expect(summaryOnlyProjects.map((project) => project.links)).toEqual([[], [], [], []]);
    expect(
      evidenceRecords
        .filter((record) => summaryOnlyIds.has(record.projectId))
        .map((record) => record.sourceReference),
    ).not.toContain("/work/bdb");
    expect(
      evidenceRecords
        .filter((record) => summaryOnlyIds.has(record.projectId))
        .map((record) => record.sourceReference),
    ).not.toContain("/work/distribution-desk");
  });

  it("uses only the approved direct capability mappings and public routes", () => {
    const byId = new Map(projects.map((project) => [project.id, project]));
    const distributionDesk = byId.get("distribution-desk");
    const storyForm = byId.get("storyform");
    const nativeSiteControl = byId.get("native-site-control");
    const weekfield = byId.get("weekfield");
    const sprintCrm = byId.get("sprintcrm");
    const presence = byId.get("presence-os-memory-atlas");

    expect(distributionDesk?.capabilityIds).toEqual([
      "electron",
      "publishing-workflow",
      "integration-workflow",
    ]);
    expect(storyForm?.capabilityIds).toEqual(["electron", "media-workflow"]);
    expect(nativeSiteControl?.capabilityIds).toEqual([
      "site-control-architecture",
      "control-contracts",
      "manifest-revision-validation",
    ]);
    expect(weekfield?.links).toEqual([
      {
        label: "CreatorOps public case",
        href: "https://brenychstudio.com/work/creatorops",
        kind: "case_study",
      },
    ]);
    expect(sprintCrm?.verificationLevels).toEqual(["verified_remote"]);
    expect(sprintCrm?.links).toEqual([
      {
        label: "Public case",
        href: "https://brenychstudio.com/work/sprintcrm",
        kind: "case_study",
      },
      {
        label: "Public repository",
        href: "https://github.com/brenychstudio/SprintCRM",
        kind: "repository",
      },
    ]);
    expect(presence?.links).toEqual([
      {
        label: "Public immersive experience",
        href: "https://brenychstudio.com/immersive/presence-os-memory-atlas",
        kind: "site",
      },
    ]);
    expect(
      evidenceRecords
        .filter((record) => record.sourceReference !== undefined)
        .every((record) => record.sourceReference?.startsWith("https://")),
    ).toBe(true);
  });

  it("uses only evidence-grounded maturity labels", () => {
    expect(projects.map((project) => [project.id, project.maturity])).toEqual([
      ["bdb", "owner_verified_implementation"],
      ["distribution-desk", "owner_verified_implementation"],
      ["weekfield", "beta_ready_prototype"],
      ["sprintcrm", "public_case"],
      ["storyform", "owner_verified_implementation"],
      ["native-site-control", "owner_verified_implementation"],
      ["presence-os-memory-atlas", "functional_mvp_prototype"],
    ]);
  });

  it("rejects normalized capability IDs, labels, and aliases that map to different capabilities", () => {
    // This catches a Map overwrite making the same normalized term resolve to an arbitrary capability.
    const collidingMcpId = "Ｅｌｅｃｔｒｏｎ";
    const idCollisionGraph = {
      capabilities: capabilities.map((capability) =>
        capability.id === "mcp" ? { ...capability, id: collidingMcpId } : capability,
      ),
      projects: projects.map((project) => ({
        ...project,
        capabilityIds: project.capabilityIds.map((capabilityId) =>
          capabilityId === "mcp" ? collidingMcpId : capabilityId,
        ),
      })),
      evidenceRecords: evidenceRecords.map((record) =>
        record.capabilityId === "mcp" ? { ...record, capabilityId: collidingMcpId } : record,
      ),
    } as unknown as FixtureGraph;
    const labelCollisionGraph = {
      ...currentGraph(),
      capabilities: capabilities.map((capability) =>
        capability.id === "mcp" ? { ...capability, label: "Electron" } : capability,
      ),
    };
    const aliasCollisionGraph = {
      ...currentGraph(),
      capabilities: capabilities.map((capability) =>
        capability.id === "mcp"
          ? { ...capability, aliases: [...capability.aliases, "Electron"] }
          : capability,
      ),
    };

    for (const graph of [idCollisionGraph, labelCollisionGraph, aliasCollisionGraph]) {
      expectIntegrityError(graph, "ambiguous normalized capability term electron");
    }
  });

  it("rejects each public-fixture integrity violation", () => {
    const duplicateProject: Project = { ...projects[0], displayName: "Duplicate BDB" };
    const duplicateCapability = { ...capabilities[0], label: "Duplicate Electron" };
    const duplicateEvidence: EvidenceRecord = {
      ...evidenceRecords[0],
      claim: "Duplicate evidence ID",
    };
    const danglingEvidence = {
      ...evidenceRecords[0],
      projectId: "unknown-project",
    } as unknown as EvidenceRecord;
    const danglingCapabilityEvidence = {
      ...evidenceRecords[0],
      capabilityId: "unknown-capability",
    } as unknown as EvidenceRecord;
    const undeclaredProjectEvidence: EvidenceRecord = {
      ...evidenceRecords[0],
      capabilityId: "crm",
    };
    const danglingCapabilityProject = {
      ...projects[0],
      capabilityIds: ["unknown-capability"],
    } as unknown as Project;
    const unsafeLinkProject: Project = {
      ...projects[2],
      links: [{ label: "Unsafe", href: "javascript:alert(1)", kind: "site" }],
    };
    const backslashPathProject: Project = {
      ...projects[2],
      links: [{ label: "Cross-origin escape", href: "/\\evil.example", kind: "site" }],
    };
    const malformedProjectLinks = ["relative/path", "example.test/page", "//host", "https:"];
    const summaryRepositoryProject: Project = {
      ...projects[0],
      links: [{ label: "Repository", href: "https://example.test/repository", kind: "repository" }],
    };
    const summaryPublicLinkProject: Project = {
      ...projects[0],
      links: [{ label: "Invented public route", href: "https://example.test/summary", kind: "site" }],
    };
    const noLimitationsProject: Project = { ...projects[0], limitations: [] };
    const whitespaceLimitationsProject: Project = { ...projects[0], limitations: ["   "] };
    const noProvenanceEvidence: EvidenceRecord = { ...evidenceRecords[0], sourceLabel: "" };
    const blankProvenanceEvidence: EvidenceRecord = {
      ...evidenceRecords[0],
      sourceLabel: "   ",
    };
    const noClaimEvidence: EvidenceRecord = { ...evidenceRecords[0], claim: "" };
    const blankClaimEvidence: EvidenceRecord = { ...evidenceRecords[0], claim: "   " };
    const unsafeProvenanceEvidence: EvidenceRecord = {
      ...evidenceRecords[0],
      sourceReference: "javascript:alert(1)",
    };
    const danglingRelatedCapability = {
      ...capabilities[0],
      relatedCapabilityIds: ["unknown-capability"],
    } as unknown as (typeof capabilities)[number];
    const bdbElectronRemoved = evidenceRecords.filter((record) => record.id !== "bdb-electron");

    expectIntegrityError(
      { ...currentGraph(), projects: [...projects, duplicateProject] },
      "exactly seven projects are required",
    );
    expectIntegrityError(
      { ...currentGraph(), projects: [duplicateProject, projects[0], ...projects.slice(2)] },
      "duplicate project IDs",
    );
    expectIntegrityError(
      {
        ...currentGraph(),
        capabilities: [duplicateCapability, capabilities[0], ...capabilities.slice(2)],
      },
      "duplicate capability IDs",
    );
    expectIntegrityError(
      {
        ...currentGraph(),
        evidenceRecords: [duplicateEvidence, evidenceRecords[0], ...evidenceRecords.slice(2)],
      },
      "duplicate evidence record IDs",
    );
    expectIntegrityError({ ...currentGraph(), projects: projects.slice(0, 6) }, "exactly seven projects");
    expectIntegrityError(
      { ...currentGraph(), evidenceRecords: [danglingEvidence, ...evidenceRecords.slice(1)] },
      "dangling project",
    );
    expectIntegrityError(
      {
        ...currentGraph(),
        evidenceRecords: [danglingCapabilityEvidence, ...evidenceRecords.slice(1)],
      },
      "dangling capability",
    );
    expectIntegrityError(
      {
        ...currentGraph(),
        evidenceRecords: [undeclaredProjectEvidence, ...evidenceRecords.slice(1)],
      },
      "evidence bdb-electron is not declared by project bdb",
    );
    expectIntegrityError(
      { ...currentGraph(), projects: [danglingCapabilityProject, ...projects.slice(1)] },
      "unknown capability",
    );
    expectIntegrityError(
      { ...currentGraph(), projects: [unsafeLinkProject, ...projects.filter((project) => project.id !== unsafeLinkProject.id)] },
      "unsafe link",
    );
    expectIntegrityError(
      {
        ...currentGraph(),
        projects: [
          backslashPathProject,
          ...projects.filter((project) => project.id !== backslashPathProject.id),
        ],
      },
      "unsafe link",
    );
    for (const href of malformedProjectLinks) {
      expectIntegrityError(
        {
          ...currentGraph(),
          projects: [
            { ...projects[2], links: [{ label: "Malformed", href, kind: "site" }] },
            ...projects.filter((project) => project.id !== projects[2].id),
          ],
        },
        "unsafe link",
      );
    }
    expectIntegrityError(
      { ...currentGraph(), projects: [summaryRepositoryProject, ...projects.slice(1)] },
      "summary-only project bdb",
    );
    expectIntegrityError(
      { ...currentGraph(), projects: [summaryPublicLinkProject, ...projects.slice(1)] },
      "summary-only project bdb",
    );
    expectIntegrityError(
      { ...currentGraph(), projects: [noLimitationsProject, ...projects.slice(1)] },
      "has no limitations",
    );
    expectIntegrityError(
      { ...currentGraph(), projects: [whitespaceLimitationsProject, ...projects.slice(1)] },
      "empty limitation",
    );
    expectIntegrityError(
      { ...currentGraph(), evidenceRecords: [noProvenanceEvidence, ...evidenceRecords.slice(1)] },
      "no provenance label",
    );
    expectIntegrityError(
      {
        ...currentGraph(),
        evidenceRecords: [blankProvenanceEvidence, ...evidenceRecords.slice(1)],
      },
      "no provenance label",
    );
    expectIntegrityError(
      { ...currentGraph(), evidenceRecords: [noClaimEvidence, ...evidenceRecords.slice(1)] },
      "has no claim",
    );
    expectIntegrityError(
      { ...currentGraph(), evidenceRecords: [blankClaimEvidence, ...evidenceRecords.slice(1)] },
      "has no claim",
    );
    expectIntegrityError(
      { ...currentGraph(), evidenceRecords: [unsafeProvenanceEvidence, ...evidenceRecords.slice(1)] },
      "unsafe or missing provenance",
    );
    for (const sourceReference of malformedProjectLinks) {
      expectIntegrityError(
        {
          ...currentGraph(),
          evidenceRecords: [
            { ...evidenceRecords[0], sourceReference },
            ...evidenceRecords.slice(1),
          ],
        },
        "unsafe or missing provenance",
      );
    }
    expectIntegrityError(
      {
        ...currentGraph(),
        capabilities: [danglingRelatedCapability, ...capabilities.slice(1)],
      },
      "unknown related capability",
    );
    expectIntegrityError(
      { ...currentGraph(), evidenceRecords: bdbElectronRemoved },
      "project bdb has no evidence for capability electron",
    );
    expectIntegrityError(
      {
        ...currentGraph(),
        evidenceRecords: evidenceRecords.filter(
          (record) => record.capabilityId !== "mcp",
        ),
      },
      "capability mcp has no evidence",
    );
  });
});
