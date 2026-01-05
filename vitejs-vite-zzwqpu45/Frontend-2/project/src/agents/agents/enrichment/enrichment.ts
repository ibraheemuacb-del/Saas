import { Candidate, addTags } from "../../_shared/types";

// Adds external signal and infers skills from role keywords
export async function enrichCandidate(input: Candidate): Promise<Candidate> {
  // Derive a base handle from candidate name
  const baseHandle = input.name
    .toLowerCase()
    .replace(/[^\w]+/g, "")
    .slice(0, 24);

  const linkedin =
    baseHandle.length > 0 ? `https://linkedin.com/in/${baseHandle}` : null;

  const github =
    input.skills.includes("javascript") ||
    input.skills.includes("typescript") ||
    input.skills.includes("python")
      ? `https://github.com/${baseHandle}`
      : null;

  // Infer skills based on role keywords
  const inferred = new Set(input.skills);
  if (input.role.includes("frontend")) {
    ["react", "javascript", "typescript"].forEach((s) => inferred.add(s));
  }
  if (input.role.includes("backend")) {
    ["node", "express", "postgres"].forEach((s) => inferred.add(s));
  }
  if (input.role.includes("data") || input.role.includes("ml")) {
    ["python", "pandas", "sql"].forEach((s) => inferred.add(s));
  }

  const enriched: Candidate = {
    ...input,
    linkedin,
    github,
    skills: Array.from(inferred),
  };

  return addTags(enriched, ["enriched"]);
}
