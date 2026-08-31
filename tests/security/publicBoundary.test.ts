import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { isIP } from "node:net";
import { describe, expect, it } from "vitest";

import { evidenceMedia } from "../../src/presentation/evidenceMedia";

const registeredPublicWebpPaths = new Set(evidenceMedia.map((item) => `public${item.src}`));
const reviewedReleaseCaptures = [
  {
    path: "docs/submission/images/01-default-evidence-field.jpg",
    sha256: "b139619e37118bbbce257e97edbd27f5d9bfe38acf191cf66d37065025faf32d",
    width: 1351,
    height: 890,
  },
  {
    path: "docs/submission/images/02-evidence-match-ranked.jpg",
    sha256: "b5d471281d85bfb7e4bc2010c360d9392e1eb62c9e3502bc038ce766960a075c",
    width: 1351,
    height: 890,
  },
  {
    path: "docs/submission/images/03-bdb-evidence-inspect.jpg",
    sha256: "e90846555706d7c06f882db2a16f0b063b77e9e75f9dfdfa9eaf45a205ffe2fc",
    width: 1351,
    height: 890,
  },
  {
    path: "docs/submission/images/04-page-local-collaboration-brief.jpg",
    sha256: "565b750169411bf7ec0e82e06204d46096e8df63477c6221e4da4c9a48732ad7",
    width: 1351,
    height: 890,
  },
  {
    path: "public/social-preview.jpg",
    sha256: "a2808f6b7105657acc29a745f7bee5cebdf4f51d97190902a44b3de369da1758",
    width: 1200,
    height: 630,
  },
] as const;
const reviewedReleaseCapturePaths: ReadonlySet<string> = new Set(reviewedReleaseCaptures.map(({ path }) => path));
const approvedBinaryPaths: ReadonlySet<string> = new Set([...registeredPublicWebpPaths, ...reviewedReleaseCapturePaths]);
const absoluteWorkstationPath = new RegExp("(?:^|[^A-Za-z0-9+.-])(?:[A-Za-z]" + ":(?:\\\\+|/)|/(?:Users|home)/)[^\\s\"']+", "i");
const privateUsernames = new Set([
  process.env.BAI_PRIVATE_USERNAME?.trim(),
].filter((value): value is string => Boolean(value && value.length >= 3)).map((value) => value.toLowerCase()));
const credentialKey = "(?:access[_-]?token|refresh[_-]?token|client[_-]?secret|api[_-]?key)";
const assignedCredential = new RegExp(`["']?${credentialKey}["']?\\s*[:=]\\s*["']?[A-Za-z0-9._~+\\/-]{8,}`, "i");
const bearerCredential = new RegExp("Bearer\\s+[A-Za-z0-9._~-]{16,}", "i");
const privateKeyHeader = /-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY-----/iu;
const providerCredential = /(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-(?:proj-|svcacct-)[A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9]{40,}|AIza[A-Za-z0-9_-]{30,})/u;
const emailAddress = /(?:^|[^A-Za-z0-9._%+-])[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?=$|[^A-Za-z0-9.-])/u;
const httpUrl = /https?:\/\/[^\s"'<>`)}]+/giu;
const strictUtf8Decoder = new TextDecoder("utf-8", { fatal: true });

const hasDisallowedTextControl = (text: string): boolean => {
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (code <= 0x08
      || code === 0x0b
      || code === 0x0c
      || (code >= 0x0e && code <= 0x1f)
      || (code >= 0x7f && code <= 0x9f)) {
      return true;
    }
  }
  return false;
};

const isPrivateNetworkHostname = (hostname: string): boolean => {
  const unwrappedHostname = hostname.replace(/^\[|\]$/gu, "").toLowerCase();

  const ipVersion = isIP(unwrappedHostname);
  if (ipVersion === 4) {
    const [first, second] = unwrappedHostname.split(".").map(Number);
    return first === 10
      || (first === 169 && second === 254)
      || (first === 172 && second >= 16 && second <= 31)
      || (first === 192 && second === 168);
  }
  if (ipVersion === 6) {
    return /^(?:fc|fd)/u.test(unwrappedHostname)
      || /^fe[89ab]/u.test(unwrappedHostname);
  }
  return false;
};

const containsPrivateNetworkUrl = (text: string): boolean => [...text.matchAll(httpUrl)].some(([candidate]) => {
  try {
    return isPrivateNetworkHostname(new URL(candidate).hostname);
  } catch {
    return false;
  }
});

const violationReasons = (
  text: string,
  usernames: ReadonlySet<string> = privateUsernames,
): readonly string[] => [
  absoluteWorkstationPath.test(text) ? "absolute workstation path" : null,
  [...usernames].some((username) => text.toLowerCase().includes(username.toLowerCase())) ? "private workstation username" : null,
  assignedCredential.test(text) ? "assigned credential-like value" : null,
  bearerCredential.test(text) ? "Bearer credential-like value" : null,
  privateKeyHeader.test(text) ? "private-key header" : null,
  providerCredential.test(text) ? "provider token-like value" : null,
  emailAddress.test(text) ? "email address" : null,
  containsPrivateNetworkUrl(text) ? "private or link-local network URL" : null,
].filter((reason): reason is string => reason !== null);

interface PublicBinarySource {
  readonly path: string;
  readonly label: string;
  readonly bytes: Buffer;
}

interface PublicTextSource extends Omit<PublicBinarySource, "bytes"> {
  readonly text: string;
}

interface JpegInspection {
  readonly width: number;
  readonly height: number;
  readonly metadataMarkers: readonly string[];
}

const startsWithHex = (bytes: Buffer, hex: string): boolean =>
  bytes.subarray(0, hex.length / 2).toString("hex") === hex;

const hasRecognizedBinarySignature = (bytes: Buffer): boolean =>
  startsWithHex(bytes, "ffd8ff")
  || startsWithHex(bytes, "89504e470d0a1a0a")
  || startsWithHex(bytes, "1f8b")
  || startsWithHex(bytes, "504b0304")
  || startsWithHex(bytes, "377abcaf271c")
  || startsWithHex(bytes, "7f454c46")
  || startsWithHex(bytes, "0061736d")
  || bytes.subarray(0, 4).toString("ascii") === "%PDF"
  || /^(?:GIF87a|GIF89a)$/u.test(bytes.subarray(0, 6).toString("ascii"))
  || (bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP");

const isStrictUtf8Text = (bytes: Buffer): boolean => {
  try {
    return !hasDisallowedTextControl(strictUtf8Decoder.decode(bytes));
  } catch {
    return false;
  }
};

const inspectJpeg = (bytes: Buffer): JpegInspection => {
  if (!startsWithHex(bytes, "ffd8ff") || bytes.subarray(-2).toString("hex") !== "ffd9") {
    throw new Error("invalid JPEG container");
  }

  const metadataMarkers: string[] = [];
  let dimensions: { readonly width: number; readonly height: number } | undefined;
  let offset = 2;

  while (offset < bytes.length - 1) {
    if (bytes[offset] !== 0xff) throw new Error(`invalid JPEG marker at byte ${offset}`);
    while (bytes[offset] === 0xff) offset += 1;
    const marker = bytes[offset];
    offset += 1;

    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) continue;
    if (offset + 2 > bytes.length) throw new Error("truncated JPEG segment length");

    const segmentLength = bytes.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > bytes.length) throw new Error("invalid JPEG segment length");
    const payloadOffset = offset + 2;

    if ((marker >= 0xe1 && marker <= 0xef) || marker === 0xfe) {
      metadataMarkers.push(`0x${marker.toString(16)}`);
    }
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      if (segmentLength < 7) throw new Error("truncated JPEG start-of-frame segment");
      dimensions = {
        width: bytes.readUInt16BE(payloadOffset + 3),
        height: bytes.readUInt16BE(payloadOffset + 1),
      };
    }

    offset += segmentLength;
  }

  if (!dimensions) throw new Error("JPEG dimensions not found");
  return { ...dimensions, metadataMarkers };
};

const gitPaths = (...args: readonly string[]): readonly string[] => execFileSync("git", [...args], { encoding: "utf8" })
  .split(/\r?\n/u)
  .filter(Boolean);

const stagedSources = (paths: readonly string[]): readonly PublicBinarySource[] => {
  if (paths.length === 0) return [];
  const batch = execFileSync("git", ["cat-file", "--batch"], {
    input: paths.map((path) => `:${path}\n`).join(""),
    maxBuffer: 32 * 1024 * 1024,
  });
  const sources: PublicBinarySource[] = [];
  let offset = 0;

  for (const path of paths) {
    const headerEnd = batch.indexOf(10, offset);
    if (headerEnd < 0) throw new Error(`Missing git cat-file header for ${path}`);
    const header = batch.subarray(offset, headerEnd).toString("utf8");
    const sizeMatch = header.match(/ blob (\d+)$/u);
    if (!sizeMatch) throw new Error(`Unexpected git cat-file header for ${path}: ${header}`);
    const contentStart = headerEnd + 1;
    const contentEnd = contentStart + Number(sizeMatch[1]);
    sources.push({ path, label: `${path} (staged)`, bytes: batch.subarray(contentStart, contentEnd) });
    offset = contentEnd + 1;
  }

  return sources;
};

const publicSources = (): readonly PublicBinarySource[] => {
  const cached = new Set(gitPaths("ls-files", "--cached"));
  const candidates = new Set([...cached, ...gitPaths("ls-files", "--others", "--exclude-standard")]);
  const paths = [...candidates];
  const staged = stagedSources(paths.filter((path) => cached.has(path)));
  const working = paths.flatMap((path) => existsSync(path)
    ? [{ path, label: `${path} (working)`, bytes: readFileSync(path) }]
    : []);
  return [...staged, ...working];
};

const publicTextSources = (): readonly PublicTextSource[] => publicSources()
  .filter(({ path, bytes }) => !approvedBinaryPaths.has(path) && isStrictUtf8Text(bytes))
  .map(({ path, label, bytes }) => ({ path, label, text: bytes.toString("utf8") }));

const unexpectedBinaryLabels = (sources: readonly PublicBinarySource[]): readonly string[] => sources
  .filter(({ path, bytes }) => !approvedBinaryPaths.has(path)
    && (!isStrictUtf8Text(bytes) || hasRecognizedBinarySignature(bytes)))
  .map(({ label }) => label);

describe("public repository boundary", () => {
  it("detects an explicitly supplied private username case-insensitively", () => {
    const syntheticUsername = ["release", "-operator"].join("");
    expect(violationReasons(`owner=${syntheticUsername.toUpperCase()}`, new Set([syntheticUsername])))
      .toContain("private workstation username");
  });

  it.each([
    [["{\"api_", "key\": \"abcdefgh1234\"}"].join(""), "assigned credential-like value"],
    [["API_", "KEY=abcdefgh1234"].join(""), "assigned credential-like value"],
    [["client", "Secret: 'abcdefgh1234'"].join(""), "assigned credential-like value"],
    [["D:", "/private/workspace/file.txt"].join(""), "absolute workstation path"],
    [["/Us", "ers/example/private.txt"].join(""), "absolute workstation path"],
    [["-----BEGIN ", "PRIVATE KEY-----"].join(""), "private-key header"],
    [["-----BEGIN ENCRYPTED ", "PRIVATE KEY-----"].join(""), "private-key header"],
    [["gh", "p_", "example", "x".repeat(24)].join(""), "provider token-like value"],
    [["s", "k-proj-", "example", "x".repeat(24)].join(""), "provider token-like value"],
    [["AI", "za", "example", "x".repeat(30)].join(""), "provider token-like value"],
    [["release-contact", "@example.invalid"].join(""), "email address"],
    [["http://10", ".0.0.8:4173/preview"].join(""), "private or link-local network URL"],
    [["https://192", ".168.20.5/internal"].join(""), "private or link-local network URL"],
    [["http://169", ".254.169.254/latest/meta-data"].join(""), "private or link-local network URL"],
    [["http://[fe", "80::1]/health"].join(""), "private or link-local network URL"],
  ])("detects representative public-boundary violation syntax", (fixture, expectedReason) => {
    expect(violationReasons(fixture)).toContain(expectedReason);
  });

  it.each([
    "sk-integration-workflow",
    "@scope/package",
    "http://127.0.0.1:4173/preview",
    "http://localhost:4173/preview",
    "https://8.8.8.8/dns-query",
    "https://[2606:4700:4700::1111]/dns-query",
  ])("does not flag representative public-safe syntax", (fixture) => {
    expect(violationReasons(fixture)).toEqual([]);
  });

  it("scans extensionless and SVG release artifacts instead of trusting an extension allowlist", () => {
    // This catches the public scan silently skipping its own guardrail, license, hosting headers, or vector metadata.
    const labels = publicTextSources().map(({ label }) => label);
    expect(labels).toEqual(expect.arrayContaining([
      "tests/security/publicBoundary.test.ts (working)",
      "LICENSE (working)",
      "public/_headers (working)",
      "public/favicon.svg (working)",
    ]));
  });

  it("rejects every non-text or recognized binary source outside the reviewed allowlist", () => {
    const approvedPath = [...registeredPublicWebpPaths][0];
    expect(unexpectedBinaryLabels([
      { path: approvedPath, label: `${approvedPath} (working)`, bytes: Buffer.from([0]) },
      { path: "public/unreviewed.bin", label: "public/unreviewed.bin (working)", bytes: Buffer.from([0]) },
      { path: "docs/unreviewed.pdf", label: "docs/unreviewed.pdf (working)", bytes: Buffer.from("%PDF-1.7\nprintable") },
      { path: "public/invalid-utf8.dat", label: "public/invalid-utf8.dat (working)", bytes: Buffer.from([0xc3, 0x28]) },
      { path: "public/control.dat", label: "public/control.dat (working)", bytes: Buffer.from([0x41, 0x07, 0x42]) },
      { path: "public/c1-control.dat", label: "public/c1-control.dat (working)", bytes: Buffer.from([0xc2, 0x85]) },
      { path: "docs/safe.txt", label: "docs/safe.txt (working)", bytes: Buffer.from("public-safe UTF-8 text\n") },
    ])).toEqual([
      "public/unreviewed.bin (working)",
      "docs/unreviewed.pdf (working)",
      "public/invalid-utf8.dat (working)",
      "public/control.dat (working)",
      "public/c1-control.dat (working)",
    ]);
  });

  it("allows only the 15 registered WebPs and five reviewed JPEG release captures as binaries", () => {
    const sources = publicSources();
    const binaryPaths = new Set(sources.filter(({ bytes }) => bytes.includes(0)).map(({ path }) => path));

    expect(registeredPublicWebpPaths.size).toBe(15);
    expect([...registeredPublicWebpPaths].every((path) => /^public\/evidence\/.+\.webp$/u.test(path))).toBe(true);
    expect(reviewedReleaseCapturePaths.size).toBe(5);
    expect(binaryPaths).toEqual(approvedBinaryPaths);
    expect(unexpectedBinaryLabels(sources)).toEqual([]);

    for (const { label, bytes } of sources.filter((source) => registeredPublicWebpPaths.has(source.path))) {
      expect(bytes.subarray(0, 4).toString("ascii"), label).toBe("RIFF");
      expect(bytes.subarray(8, 12).toString("ascii"), label).toBe("WEBP");
    }
    for (const { label, bytes } of sources.filter((source) => reviewedReleaseCapturePaths.has(source.path))) {
      expect(bytes.subarray(0, 3).toString("hex"), label).toBe("ffd8ff");
      expect(bytes.subarray(-2).toString("hex"), label).toBe("ffd9");
    }
  });

  it("pins every reviewed release JPEG by SHA-256, dimensions, and absent private metadata", () => {
    const expectedByPath = new Map<string, (typeof reviewedReleaseCaptures)[number]>(
      reviewedReleaseCaptures.map((capture) => [capture.path, capture]),
    );
    const sources = publicSources().filter(({ path }) => reviewedReleaseCapturePaths.has(path));

    expect(new Set(sources.map(({ path }) => path))).toEqual(reviewedReleaseCapturePaths);
    for (const { path, label, bytes } of sources) {
      const expected = expectedByPath.get(path);
      expect(expected, label).toBeDefined();
      expect(createHash("sha256").update(bytes).digest("hex"), label).toBe(expected?.sha256);
      expect(inspectJpeg(bytes), label).toEqual({
        width: expected?.width,
        height: expected?.height,
        metadataMarkers: [],
      });
    }
  });

  it("detects application metadata outside the accepted JFIF segment", () => {
    const source = readFileSync(reviewedReleaseCaptures[0].path);
    const app3Segment = Buffer.from([0xff, 0xe3, 0x00, 0x04, 0x41, 0x42]);
    const withApplicationMetadata = Buffer.concat([source.subarray(0, 2), app3Segment, source.subarray(2)]);

    expect(inspectJpeg(withApplicationMetadata).metadataMarkers).toEqual(["0xe3"]);
  });

  it("contains no private or credential-bearing text", () => {
    const violations = publicTextSources().flatMap(({ label, text }) => {
      const reasons = violationReasons(text);
      return reasons.map((reason) => `${label}: ${reason}`);
    });

    expect(violations).toEqual([]);
  });
});
