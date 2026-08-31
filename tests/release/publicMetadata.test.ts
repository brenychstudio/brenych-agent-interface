import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const readMetadata = () => {
  const html = readFileSync("index.html", "utf8");
  return new DOMParser().parseFromString(html, "text/html");
};

describe("public release metadata", () => {
  it("gives browser and social consumers a complete challenge-release identity", () => {
    // This catches a release that renders correctly but is anonymous or misleading when linked publicly.
    const metadata = readMetadata();
    const content = (selector: string) => metadata.querySelector<HTMLMetaElement>(selector)?.content;

    expect(metadata.title).toBe("Brenych Agent Interface");
    expect(content('meta[name="description"]')).toMatch(/WebMCP evidence workspace/i);
    expect(content('meta[name="viewport"]')).toBe("width=device-width, initial-scale=1.0");
    expect(content('meta[name="theme-color"]')).toMatch(/^#[a-f0-9]{6}$/i);
    expect(content('meta[property="og:title"]')).toBe("Brenych Agent Interface");
    expect(content('meta[property="og:description"]')).toMatch(/WebMCP evidence workspace/i);
    expect(content('meta[property="og:image"]')).toBe(
      "https://brenych-agent-interface.pages.dev/social-preview.jpg",
    );
    expect(content('meta[property="og:image:width"]')).toBe("1200");
    expect(content('meta[property="og:image:height"]')).toBe("630");
    expect(content('meta[name="twitter:card"]')).toBe("summary_large_image");
    expect(metadata.querySelector<HTMLLinkElement>('link[rel="icon"]')?.href).toContain("/favicon.svg");
  });
});
