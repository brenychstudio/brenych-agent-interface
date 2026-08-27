import { INPUT_LIMITS } from "../domain/limits";

export const PUBLIC_INPUT_LIMITS = Object.freeze({
  requirementCount: INPUT_LIMITS.requirementCount,
  requirementLength: INPUT_LIMITS.requirementLength,
  projectTypeLength: INPUT_LIMITS.projectTypeLength,
  contextLength: INPUT_LIMITS.contextLength,
  timelineLength: INPUT_LIMITS.timelineLength,
  budgetLength: INPUT_LIMITS.budgetLength,
});

export const BRIEF_REQUIREMENTS_HINT = `One requirement per line; 1-${PUBLIC_INPUT_LIMITS.requirementCount} requirements, each 1-${PUBLIC_INPUT_LIMITS.requirementLength} characters.`;

export const BRIEF_REQUIREMENTS_MAX_LENGTH =
  PUBLIC_INPUT_LIMITS.requirementCount * PUBLIC_INPUT_LIMITS.requirementLength
  + PUBLIC_INPUT_LIMITS.requirementCount - 1;

export const parseBriefRequirements = (value: string): readonly string[] => {
  if (value.length > BRIEF_REQUIREMENTS_MAX_LENGTH) {
    throw new RangeError(`requirements text must be at most ${BRIEF_REQUIREMENTS_MAX_LENGTH} characters`);
  }
  const requirements = value.split(/\r?\n/).map((requirement) => requirement.trim());
  if (requirements.length < 1 || requirements.length > PUBLIC_INPUT_LIMITS.requirementCount) {
    throw new RangeError(`requirements must contain between 1 and ${PUBLIC_INPUT_LIMITS.requirementCount} requirements`);
  }
  requirements.forEach((requirement, index) => {
    if (requirement.length < 1 || requirement.length > PUBLIC_INPUT_LIMITS.requirementLength) {
      throw new RangeError(`requirement ${index + 1} must be 1 to ${PUBLIC_INPUT_LIMITS.requirementLength} characters`);
    }
  });
  return requirements;
};
