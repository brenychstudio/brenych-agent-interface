import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { evidenceMedia } from "../../src/presentation/evidenceMedia";

const publicRoot = join(process.cwd(), "public");

const filesBelow = (directory: string): readonly string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  });

describe("approved evidence media", () => {
  it("publishes exactly the 15 selected derivatives with stable public metadata", () => {
    // This catches an approved screenshot being omitted, a reserve image being imported,
    // or media being attached to an unknown owner without a stable accessible contract.
    expect(evidenceMedia.map((item) => item.id)).toEqual([
      "bdb-task-control",
      "bdb-workspace",
      "distribution-campaign-setup",
      "distribution-campaign-workspace",
      "storyform-editor-workflow",
      "model-site-portfolio",
      "model-site-builder",
      "photo-web-entry",
      "photo-web-series",
      "artist-stage-meta-bodies",
      "artist-stage-inner-structures",
      "webhero-living-environments",
      "webhero-metamorph-bubbles",
      "weekfield-smart-mix",
      "weekfield-planet-field",
    ]);
    expect(new Set(evidenceMedia.map((item) => item.id)).size).toBe(15);
    expect(evidenceMedia.filter((item) => item.role === "primary")).toHaveLength(8);
    expect(evidenceMedia.filter((item) => item.role === "secondary")).toHaveLength(7);

    for (const item of evidenceMedia) {
      expect(item.src).toMatch(/^\/evidence\/[a-z0-9-]+\/[a-z0-9-]+\.webp$/);
      expect(item.alt.trim().length).toBeGreaterThan(20);
      expect(item.caption.trim().length).toBeGreaterThan(3);
      expect(item.sourceKind).toBe("user_approved_screenshot");
      expect(item.publicSafe).toBe(true);
      expect(item.contentHash).toMatch(/^[a-f0-9]{64}$/);
      expect(item.width).toBeGreaterThan(0);
      expect(item.height).toBeGreaterThan(0);
    }
  });

  it("matches every committed derivative to its declared SHA-256 digest", () => {
    // This catches a derivative being silently replaced without updating its reviewed provenance.
    for (const item of evidenceMedia) {
      const path = join(publicRoot, item.src.slice(1));
      expect(existsSync(path), item.id).toBe(true);
      const bytes = readFileSync(path);
      expect(createHash("sha256").update(bytes).digest("hex"), item.id).toBe(item.contentHash);
      expect(statSync(path).size, item.id).toBeGreaterThan(0);
    }
  });

  it("contains no unregistered derivative or reserved source stem", () => {
    // This catches accidental publication of one of the four ULTRA-03 reserve screenshots.
    const files = filesBelow(join(publicRoot, "evidence"));
    expect(files).toHaveLength(15);
    expect(files.every((path) => path.endsWith(".webp"))).toBe(true);
    expect(files.join("\n")).not.toMatch(/creatorops|photography-1|artist-stage-1|system-21/i);
    expect(new Set(files.map((path) => path.replace(publicRoot, "").replaceAll("\\", "/"))))
      .toEqual(new Set(evidenceMedia.map((item) => item.src)));
  });

  it("keeps committed provenance free of absolute local paths", () => {
    // This catches a source-machine path entering the typed registry.
    const privateUsername = ["CONCEPT", "2048"].join("");
    expect(JSON.stringify(evidenceMedia)).not.toMatch(/[A-Za-z]:\\|webmcp-pictures/i);
    expect(JSON.stringify(evidenceMedia)).not.toContain(privateUsername);
  });
});
