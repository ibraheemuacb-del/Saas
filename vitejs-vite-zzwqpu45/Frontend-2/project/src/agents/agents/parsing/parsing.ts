import type { Candidate } from "../_shared/types";

/**
 * Parse a raw CV object into a canonical Candidate structure.
 * Ensures all required fields are present and returns defaults if missing.
 */
export function parseCv(raw: any): Candidate {
  if (!raw) {
    // Safe default return if nothing is provided
    return {
      job_id: "",
      name: "",
      role: "",
      location: "",
      experience_years: 0,
      skills: [],
      tags: ["parsed"],
    };
  }

  return {
    job_id: raw.job_id ?? "",
    name: raw.name ?? "",
    role: raw.role ?? "",
    location: raw.location ?? "",
    experience_years: raw.experience_years ?? 0,
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    tags: ["parsed"],
  };
}
