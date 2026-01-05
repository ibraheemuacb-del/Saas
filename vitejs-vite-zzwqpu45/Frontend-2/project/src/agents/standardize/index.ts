import { Candidate, addTags } from "../_shared/types";

// Normalizes casing/structure into canonical schema
export async function standardizeCandidate(input: Candidate): Promise<Candidate> {
  const role = input.role.toLowerCase();
  const skills = (input.skills || []).map((s) => s.toLowerCase());

  const standardized: Candidate = {
    ...input,
    name: input.name.trim(),
    role,
    location: input.location.trim(),
    experience_years: Math.max(0, Math.floor(input.experience_years || 0)),
    skills,
  };

  return addTags(standardized, ["standardized"]);
}
