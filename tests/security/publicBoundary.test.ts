import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { extname } from "node:path";
import { describe, expect, it } from "vitest";

const textExtensions = new Set([".css", ".html", ".json", ".md", ".mjs", ".ts", ".tsx", ".txt", ".yml", ".yaml"]);
const testPath = "tests/security/publicBoundary.test.ts";
const absoluteWorkstationPath = new RegExp("(?:^|[^A-Za-z0-9+.-])(?:[A-Za-z]" + ":(?:\\\\+|/)|/(?:Users|home)/)[^\\s\"']+", "i");
const privateUsername = ["CONCEPT", "2048"].join("");
const credentialKey = "(?:access[_-]?token|refresh[_-]?token|client[_-]?secret|api[_-]?key)";
const assignedCredential = new RegExp(`["']?${credentialKey}["']?\\s*[:=]\\s*["']?[A-Za-z0-9._~+\\/-]{8,}`, "i");
const bearerCredential = new RegExp("Bearer\\s+[A-Za-z0-9._~-]{16,}", "i");

const violationReasons = (text: string): readonly string[] => [
  absoluteWorkstationPath.test(text) ? "absolute workstation path" : null,
  text.includes(privateUsername) ? "private workstation username" : null,
  assignedCredential.test(text) ? "assigned credential-like value" : null,
  bearerCredential.test(text) ? "Bearer credential-like value" : null,
].filter((reason): reason is string => reason !== null);

interface PublicTextSource {
  readonly label: string;
  readonly text: string;
}

const gitPaths = (...args: readonly string[]): readonly string[] => execFileSync("git", [...args], { encoding: "utf8" })
  .split(/\r?\n/u)
  .filter(Boolean);

const stagedTextSources = (paths: readonly string[]): readonly PublicTextSource[] => {
  if (paths.length === 0) return [];
  const batch = execFileSync("git", ["cat-file", "--batch"], {
    input: paths.map((path) => `:${path}\n`).join(""),
  });
  const sources: PublicTextSource[] = [];
  let offset = 0;

  for (const path of paths) {
    const headerEnd = batch.indexOf(10, offset);
    if (headerEnd < 0) throw new Error(`Missing git cat-file header for ${path}`);
    const header = batch.subarray(offset, headerEnd).toString("utf8");
    const sizeMatch = header.match(/ blob (\d+)$/u);
    if (!sizeMatch) throw new Error(`Unexpected git cat-file header for ${path}: ${header}`);
    const contentStart = headerEnd + 1;
    const contentEnd = contentStart + Number(sizeMatch[1]);
    sources.push({ label: `${path} (staged)`, text: batch.subarray(contentStart, contentEnd).toString("utf8") });
    offset = contentEnd + 1;
  }

  return sources;
};

const publicTextSources = (): readonly PublicTextSource[] => {
  const cached = new Set(gitPaths("ls-files", "--cached"));
  const candidates = new Set([...cached, ...gitPaths("ls-files", "--others", "--exclude-standard")]);
  const textPaths = [...candidates].filter((path) => path !== testPath && textExtensions.has(extname(path).toLowerCase()));
  const staged = stagedTextSources(textPaths.filter((path) => cached.has(path)));
  const working = textPaths.flatMap((path) => existsSync(path)
    ? [{ label: `${path} (working)`, text: readFileSync(path, "utf8") }]
    : []);
  return [...staged, ...working];
};

describe("public repository boundary", () => {
  it.each([
    ['{"api_key": "abcdefgh1234"}', "assigned credential-like value"],
    ["API_KEY=abcdefgh1234", "assigned credential-like value"],
    ["clientSecret: 'abcdefgh1234'", "assigned credential-like value"],
    ["D:/private/workspace/file.txt", "absolute workstation path"],
    ["/Users/example/private.txt", "absolute workstation path"],
  ])("detects representative public-boundary violation syntax", (fixture, expectedReason) => {
    expect(violationReasons(fixture)).toContain(expectedReason);
  });

  it("contains no absolute workstation paths, private username, or assigned credentials", () => {
    const violations = publicTextSources().flatMap(({ label, text }) => {
      const reasons = violationReasons(text);
      return reasons.map((reason) => `${label}: ${reason}`);
    });

    expect(violations).toEqual([]);
  });
});
