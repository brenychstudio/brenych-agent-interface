import type { ProjectId } from "../domain/types";

export type ProjectPresentationTier = "flagship" | "extended";
export type ProjectVisualForm = "evidence-object" | "extended-signal";

export interface PresentationSlot {
  readonly x: number;
  readonly y: number;
}

export interface ProjectPresentation {
  readonly tier: ProjectPresentationTier;
  readonly defaultSlot: PresentationSlot;
  readonly defaultVisual: {
    readonly z: number;
    readonly scale: number;
    readonly opacity: number;
    readonly zIndex: number;
  };
}

export const flagshipProjectIds = [
  "bdb",
  "weekfield",
  "distribution-desk",
  "storyform",
] as const satisfies readonly ProjectId[];

export const extendedProjectIds = [
  "sprintcrm",
  "native-site-control",
  "presence-os-memory-atlas",
] as const satisfies readonly ProjectId[];

export const projectPresentation = Object.freeze({
  bdb: { tier: "flagship", defaultSlot: { x: 4, y: 19 }, defaultVisual: { z: 18, scale: 1.05, opacity: 1, zIndex: 30 } },
  weekfield: { tier: "flagship", defaultSlot: { x: 58, y: 5 }, defaultVisual: { z: 8, scale: 1, opacity: .96, zIndex: 25 } },
  "distribution-desk": { tier: "flagship", defaultSlot: { x: 37, y: 40 }, defaultVisual: { z: -40, scale: .88, opacity: .78, zIndex: 16 } },
  storyform: { tier: "flagship", defaultSlot: { x: 12, y: 64 }, defaultVisual: { z: 4, scale: .98, opacity: .92, zIndex: 22 } },
  sprintcrm: { tier: "extended", defaultSlot: { x: 82, y: 34 }, defaultVisual: { z: -70, scale: .86, opacity: .62, zIndex: 9 } },
  "native-site-control": { tier: "extended", defaultSlot: { x: 72, y: 73 }, defaultVisual: { z: -76, scale: .82, opacity: .56, zIndex: 8 } },
  "presence-os-memory-atlas": { tier: "extended", defaultSlot: { x: 47, y: 64 }, defaultVisual: { z: -82, scale: .8, opacity: .52, zIndex: 7 } },
} satisfies Readonly<Record<ProjectId, ProjectPresentation>>);

export const rankedPresentationSlots = Object.freeze([
  { x: 35, y: 12 },
  { x: 5, y: 34 },
  { x: 68, y: 35 },
  { x: 4, y: 58 },
  { x: 28, y: 61 },
  { x: 54, y: 57 },
  { x: 79, y: 60 },
] satisfies readonly PresentationSlot[]);
