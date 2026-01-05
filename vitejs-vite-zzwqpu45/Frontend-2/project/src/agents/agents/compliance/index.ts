import { Candidate, addTags } from "../../_shared/types";

// Required fields and range checks; emits compliance tags
export async function checkCompliance(input: Candidate): Promise<Candidate> {
  const tags: string[] = [];

  if (!input.name) tags.push("missing_name");
  if (!input.role) tags.push("missing_role");
  if (!input.location) tags.push("missing_location");

  if (!Number.isFinite(input.experience_years)) {
    tags.push("invalid_experience");
  } else if (input.experience_years < 0 || input.experience_years > 60) {
    tags.push("out_of_range_experience");
  }

  const compliant = tags.length === 0;

  const candidate: Candidate = {
    ...input,
    compliant,
    compliance_tags: tags,
  };

  return addTags(candidate, ["compliance_checked"]);
}
