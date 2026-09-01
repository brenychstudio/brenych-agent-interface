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
  readonly sourceKind: string;
  readonly publicSafe: boolean;
}

const approvedEvidenceRows: readonly ManifestEvidenceRow[] = [
  { id: "bdb-task-control", ownerId: "bdb", role: "primary", path: "public/evidence/bdb/bdb-task-control.webp", contentHash: "4a622248fb29c67205fef0aba916da08c35867192ea329de0f04cca887757634", width: 1529, height: 976, caption: "Task Control Center / controlled workflow", sourceKind: "user_approved_screenshot", publicSafe: true },
  { id: "bdb-workspace", ownerId: "bdb", role: "secondary", path: "public/evidence/bdb/bdb-workspace.webp", contentHash: "03f161386c25cc3a29ef504054a270e9281b9fef7e7204c8dc30481acff35f2b", width: 954, height: 870, caption: "Workspace management / BAI registered project", sourceKind: "user_approved_screenshot", publicSafe: true },
  { id: "distribution-campaign-setup", ownerId: "distribution-desk", role: "primary", path: "public/evidence/distribution-desk/distribution-campaign-setup.webp", contentHash: "59a98a89227da4cecb17073bd084352503e529b7a8183ad66a940238f24f37ea", width: 1642, height: 1050, caption: "Campaign preparation / structured workflow", sourceKind: "user_approved_screenshot", publicSafe: true },
  { id: "distribution-campaign-workspace", ownerId: "distribution-desk", role: "secondary", path: "public/evidence/distribution-desk/distribution-campaign-workspace.webp", contentHash: "ac7df387f8f6ee842ca1182b5961386a6eb8c46a3130abffe4e93c7dc1dd756c", width: 1601, height: 962, caption: "Campaign workspace / continuation state", sourceKind: "user_approved_screenshot", publicSafe: true },
  { id: "storyform-editor-workflow", ownerId: "storyform", role: "primary", path: "public/evidence/storyform/storyform-editor-workflow.webp", contentHash: "25ec7624aa32bbc65d3166198276e124d0dc243524321243e9496801c364b568", width: 1868, height: 1099, caption: "Storyboard + AI workflow + editing surface", sourceKind: "user_approved_screenshot", publicSafe: true },
  { id: "model-site-portfolio", ownerId: "model-site", role: "primary", path: "public/evidence/model-site/model-site-portfolio.webp", contentHash: "70cc304ec1d2c14c688fccdffd4e53d2416049a2d28a5f4222ac5262675d10e7", width: 2000, height: 1156, caption: "Public model portfolio", sourceKind: "user_approved_screenshot", publicSafe: true },
  { id: "model-site-builder", ownerId: "model-site", role: "secondary", path: "public/evidence/model-site/model-site-builder.webp", contentHash: "7c22fd64613f44c8d5d9390460a142a0d3c97e01a116adb3a1194fe577181b11", width: 2200, height: 1088, caption: "Live builder / assisted portfolio management", sourceKind: "user_approved_screenshot", publicSafe: true },
  { id: "photo-web-entry", ownerId: "photo-web", role: "primary", path: "public/evidence/photo-web/photo-web-entry.webp", contentHash: "d13d33296b9aeee4c3941338fd4c9bb099c0b63df308ee7ea2e93e4d776482e8", width: 2400, height: 1658, caption: "Authored photography entry", sourceKind: "user_approved_screenshot", publicSafe: true },
  { id: "photo-web-series", ownerId: "photo-web", role: "secondary", path: "public/evidence/photo-web/photo-web-series.webp", contentHash: "065345ed7d64da081b33b5e3b70723127934768ba62c5a930980a74d41441405", width: 2400, height: 1658, caption: "Living series field", sourceKind: "user_approved_screenshot", publicSafe: true },
  { id: "artist-stage-meta-bodies", ownerId: "artist-stage", role: "primary", path: "public/evidence/artist-stage/artist-stage-meta-bodies.webp", contentHash: "17d33c30635eea36cfdf1097ce6f1c2a9b56e21db504cc4ddaa403a775c3021e", width: 2560, height: 1698, caption: "Meta Bodies authored field", sourceKind: "user_approved_screenshot", publicSafe: true },
  { id: "artist-stage-inner-structures", ownerId: "artist-stage", role: "secondary", path: "public/evidence/artist-stage/artist-stage-inner-structures.webp", contentHash: "537d6195d3cda4ddadd46035a22e1c7aba7b4e39bd59ac32cc034ffa0211ae14", width: 2560, height: 1640, caption: "Inner Structures living series field", sourceKind: "user_approved_screenshot", publicSafe: true },
  { id: "webhero-living-environments", ownerId: "webhero", role: "primary", path: "public/evidence/webhero/webhero-living-environments.webp", contentHash: "d62eec3c9a8528a97f04c020bc06ab2ec0abf870f8eedb1e34d9440fe79b111d", width: 2560, height: 1524, caption: "Interfaces as living environments", sourceKind: "user_approved_screenshot", publicSafe: true },
  { id: "webhero-metamorph-bubbles", ownerId: "webhero", role: "secondary", path: "public/evidence/webhero/webhero-metamorph-bubbles.webp", contentHash: "7cbdd5798b72cf1119819e4c4cfe130977d60f5e3b4ba482cc2674fed30fee0d", width: 2560, height: 1524, caption: "Metamorph Bubbles / WebGL object proof", sourceKind: "user_approved_screenshot", publicSafe: true },
  { id: "weekfield-smart-mix", ownerId: "weekfield", role: "primary", path: "public/evidence/weekfield/weekfield-smart-mix.webp", contentHash: "74d59b903a69a682e5d4020b4d5bb971ec1927b417b2042865095dd26dc636f2", width: 2560, height: 1640, caption: "Smart Mix", sourceKind: "user_approved_screenshot", publicSafe: true },
  { id: "weekfield-planet-field", ownerId: "weekfield", role: "secondary", path: "public/evidence/weekfield/weekfield-planet-field.webp", contentHash: "3af743d180fad05c3c657d52daf1dd66ed6c69a696d364b46aa7312f5fb47aba", width: 2560, height: 1640, caption: "Planet Field", sourceKind: "user_approved_screenshot", publicSafe: true },
  { id: "presence-os-memory-field", ownerId: "presence-os-memory-atlas", role: "primary", path: "public/evidence/presence-os-memory-atlas/presence-os-memory-field.webp", contentHash: "5ba51cd14175b8386ed032075a6fb39a49b8199f39d97808b76bca751a9978bb", width: 3978, height: 2368, caption: "Memory Atlas entry field", sourceKind: "user_approved_screenshot", publicSafe: true },
  { id: "presence-os-spatial-inspect", ownerId: "presence-os-memory-atlas", role: "secondary", path: "public/evidence/presence-os-memory-atlas/presence-os-spatial-inspect.webp", contentHash: "7d7d39a36a14495a92c2c728baa0774bfab9ebb9a5f227522078196f32dc2e17", width: 3978, height: 2368, caption: "Spatial memory field / recovered trace", sourceKind: "user_approved_screenshot", publicSafe: true },
  { id: "sprintcrm-workspace", ownerId: "sprintcrm", role: "primary", path: "public/evidence/sprintcrm/sprintcrm-workspace.webp", contentHash: "1f4cd230b3bee9b7169f3de2ef93eb8d8f490c79fad62c1eae2711b6d952863c", width: 1597, height: 1000, caption: "SprintCRM operator workspace entry", sourceKind: "user_approved_screenshot", publicSafe: true },
];

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
    if (cells.length !== 9) throw new Error(`Manifest row ${rowNumber} has ${cells.length} cells instead of 9`);

    const [idCell, ownerCell, roleCell, pathCell, hashCell, dimensionsCell, caption, sourceKindCell, publicSafeCell] = cells;
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

    const sourceKind = codeCellValue(sourceKindCell, "source kind", rowNumber);
    if (sourceKind !== "user_approved_screenshot") {
      throw new Error(`Manifest row ${rowNumber} has an invalid source kind: ${sourceKind}`);
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
      sourceKind,
      publicSafe: publicSafeSemantic === "yes",
    };
  });

describe("approved evidence media", () => {
  it("publishes exactly the 18 selected derivatives with stable public metadata", () => {
    // This catches an approved screenshot being omitted, a reserve image being imported,
    // or media being attached to an unknown owner without a stable accessible contract.
    expect(evidenceMedia.map((item) => ({
      id: item.id,
      ownerId: item.ownerId,
      role: item.role,
      path: `public${item.src}`,
      contentHash: item.contentHash,
      width: item.width,
      height: item.height,
      caption: item.caption,
      sourceKind: item.sourceKind,
      publicSafe: item.publicSafe,
    }))).toEqual(approvedEvidenceRows);
    expect(new Set(evidenceMedia.map((item) => item.id)).size).toBe(18);
    expect(evidenceMedia.filter((item) => item.role === "primary")).toHaveLength(10);
    expect(evidenceMedia.filter((item) => item.role === "secondary")).toHaveLength(8);

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

  it("keeps all 18 manifest rows aligned with the approved provenance contract", () => {
    // This catches any provenance field drifting independently in release documentation.
    const manifest = readFileSync(manifestPath, "utf8");
    expect(parseManifestEvidenceRows(manifest)).toEqual(approvedEvidenceRows);
  });

  it("contains no unregistered derivative or reserved source stem", () => {
    // This catches accidental publication of one of the four ULTRA-03 reserve screenshots.
    const files = filesBelow(join(publicRoot, "evidence"));
    expect(files).toHaveLength(18);
    expect(files.every((path) => path.endsWith(".webp"))).toBe(true);
    expect(files.join("\n")).not.toMatch(/creatorops|photography-1|artist-stage-1|system-21|presence-os-memory-atlas-5/i);
    expect(new Set(files.map((path) => path.replace(publicRoot, "").replaceAll("\\", "/"))))
      .toEqual(new Set(evidenceMedia.map((item) => item.src)));
  });

  it("keeps committed provenance free of absolute local paths", () => {
    // This catches a source-machine path entering the typed registry.
    expect(JSON.stringify(evidenceMedia)).not.toMatch(/[A-Za-z]:\\|webmcp-pictures/i);
  });
});
