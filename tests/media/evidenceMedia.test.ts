import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { evidenceMedia } from "../../src/presentation/evidenceMedia";

const publicRoot = join(process.cwd(), "public");
const manifestPath = join(process.cwd(), "docs", "EVIDENCE-MEDIA-MANIFEST.md");

const uint24 = (bytes: Buffer, offset: number): number =>
  bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);

const webpDimensions = (bytes: Buffer): { readonly width: number; readonly height: number } => {
  if (bytes.subarray(0, 4).toString("ascii") !== "RIFF" || bytes.subarray(8, 12).toString("ascii") !== "WEBP") {
    throw new Error("invalid WebP container");
  }

  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const chunkType = bytes.subarray(offset, offset + 4).toString("ascii");
    const chunkLength = bytes.readUInt32LE(offset + 4);
    const payload = offset + 8;

    if (chunkType === "VP8 ") {
      if (bytes.subarray(payload + 3, payload + 6).toString("hex") !== "9d012a") throw new Error("invalid VP8 frame");
      return {
        width: bytes.readUInt16LE(payload + 6) & 0x3fff,
        height: bytes.readUInt16LE(payload + 8) & 0x3fff,
      };
    }
    if (chunkType === "VP8L") {
      if (bytes[payload] !== 0x2f) throw new Error("invalid VP8L frame");
      const b1 = bytes[payload + 1];
      const b2 = bytes[payload + 2];
      const b3 = bytes[payload + 3];
      const b4 = bytes[payload + 4];
      return {
        width: 1 + b1 + ((b2 & 0x3f) << 8),
        height: 1 + (b2 >> 6) + (b3 << 2) + ((b4 & 0x0f) << 10),
      };
    }
    if (chunkType === "VP8X") {
      return {
        width: 1 + uint24(bytes, payload + 4),
        height: 1 + uint24(bytes, payload + 7),
      };
    }

    offset = payload + chunkLength + (chunkLength % 2);
  }

  throw new Error("WebP dimensions not found");
};

const filesBelow = (directory: string): readonly string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  });

interface ManifestEvidenceRow {
  readonly id: string;
  readonly ownerId: string;
  readonly role: "primary" | "secondary";
  readonly path: string;
  readonly contentHash: string;
  readonly width: number;
  readonly height: number;
  readonly caption: string;
  readonly publicSafe: boolean;
}

const codeCellValue = (cell: string, field: string, rowNumber: number): string => {
  const match = cell.match(/^`([^`]+)`$/u);
  if (!match) throw new Error(`Manifest row ${rowNumber} has an invalid ${field} cell: ${cell}`);
  return match[1];
};

const parseManifestEvidenceRows = (manifest: string): readonly ManifestEvidenceRow[] => manifest
  .split(/\r?\n/u)
  .filter((line) => /^\|\s*`/u.test(line))
  .map((line, rowIndex) => {
    const rowNumber = rowIndex + 1;
    const cells = line.slice(1, -1).split("|").map((cell) => cell.trim());
    if (cells.length !== 8) throw new Error(`Manifest row ${rowNumber} has ${cells.length} cells instead of 8`);

    const [idCell, ownerCell, roleCell, pathCell, hashCell, dimensionsCell, caption, publicSafeCell] = cells;
    if (roleCell !== "primary" && roleCell !== "secondary") {
      throw new Error(`Manifest row ${rowNumber} has an invalid role: ${roleCell}`);
    }

    const contentHash = codeCellValue(hashCell, "SHA-256", rowNumber);
    if (!/^[a-f0-9]{64}$/u.test(contentHash)) {
      throw new Error(`Manifest row ${rowNumber} has an invalid SHA-256 digest: ${contentHash}`);
    }

    const dimensions = codeCellValue(dimensionsCell, "dimensions", rowNumber).match(/^(\d+)x(\d+)$/u);
    if (!dimensions) throw new Error(`Manifest row ${rowNumber} has invalid dimensions: ${dimensionsCell}`);

    const publicSafeSemantic = publicSafeCell.split(";", 1)[0].trim().toLowerCase();
    if (publicSafeSemantic !== "yes" && publicSafeSemantic !== "no") {
      throw new Error(`Manifest row ${rowNumber} has invalid public-safe semantics: ${publicSafeCell}`);
    }

    return {
      id: codeCellValue(idCell, "asset ID", rowNumber),
      ownerId: codeCellValue(ownerCell, "owner", rowNumber),
      role: roleCell,
      path: codeCellValue(pathCell, "committed path", rowNumber),
      contentHash,
      width: Number(dimensions[1]),
      height: Number(dimensions[2]),
      caption,
      publicSafe: publicSafeSemantic === "yes",
    };
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
    // This catches a derivative being silently replaced or resized without updating reviewed provenance.
    for (const item of evidenceMedia) {
      const path = join(publicRoot, item.src.slice(1));
      expect(existsSync(path), item.id).toBe(true);
      const bytes = readFileSync(path);
      expect(createHash("sha256").update(bytes).digest("hex"), item.id).toBe(item.contentHash);
      expect(webpDimensions(bytes), item.id).toEqual({ width: item.width, height: item.height });
      expect(statSync(path).size, item.id).toBeGreaterThan(0);
    }
  });

  it("keeps all 15 manifest rows aligned with the typed media registry", () => {
    // This catches any provenance field drifting independently in release documentation.
    const manifest = readFileSync(manifestPath, "utf8");
    expect(parseManifestEvidenceRows(manifest)).toEqual(evidenceMedia.map((item) => ({
      id: item.id,
      ownerId: item.ownerId,
      role: item.role,
      path: `public${item.src}`,
      contentHash: item.contentHash,
      width: item.width,
      height: item.height,
      caption: item.caption,
      publicSafe: item.publicSafe,
    })));
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
    expect(JSON.stringify(evidenceMedia)).not.toMatch(/[A-Za-z]:\\|webmcp-pictures/i);
  });
});
