import type { NormalizedRequirement } from "./types";

const punctuation = /\p{P}+/gu;
const whitespace = /\s+/gu;

export const normalizeRequirement = (original: string): NormalizedRequirement => ({
  original: original.trim(),
  normalized: original
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(punctuation, " ")
    .replace(whitespace, " ")
    .trim(),
});
