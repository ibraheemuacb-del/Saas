import { supabase } from "../../../lib/supabase";
import { parseCv } from "../parsing/parsing";
import { standardizeCandidate } from "../../standardize";
import { enrichCandidate } from "../enrichment/enrichment";
import { checkCompliance } from "../compliance/index";
import { scoreCandidate } from "../scoring/index";
import { runStage, backfillAllStatuses } from "../../_shared/supabaseStage";
import type { Candidate } from "../../_shared/types";


export async function ingestCv(jobId: string, rawCv: any): Promise<Candidate | null> {
  // Stage 1: Parse
  const s1 = await runStage("parsed", () => parseCv(rawCv), { job_id: jobId, payload: rawCv });
  if (!s1.ok) return null;

  // Stage 2: Standardize
  const s2 = await runStage("standardized", () => standardizeCandidate(s1.result), { job_id: jobId });
  if (!s2.ok) return null;

  // Stage 3: Enrich
  const s3 = await runStage("enriched", () => enrichCandidate(s2.result), { job_id: jobId });
  if (!s3.ok) return null;

  // Stage 4: Compliance
  const s4 = await runStage("compliance", () => checkCompliance(s3.result), { job_id: jobId });
  if (!s4.ok) return null;

  // Stage 5: Scoring
  const s5 = await runStage("scored", () => scoreCandidate(s4.result, jobId), { job_id: jobId });
  if (!s5.ok) return null;

  const scored = s5.result;

  // Final insert into candidates with canonical columns and stage statuses
  const { data, error } = await supabase
    .from("candidates")
    .insert([
      {
        job_id: scored.job_id,
        name: scored.name,
        role: scored.role,
        location: scored.location,
        experience_years: scored.experience_years,
        skills: scored.skills,
        linkedin: scored.linkedin,
        github: scored.github,

        compliant: scored.compliant,
        compliance_tags: scored.compliance_tags,

        tags: scored.tags,

        pre_score: scored.pre_score,
        post_score: scored.post_score,
        final_score: scored.final_score,

        interview_score: scored.interview_score ?? null,
        rating: scored.rating ?? null,

        reference_status: scored.reference_status ?? null,
        reference_source: scored.reference_source ?? null,
        reference_locked: scored.reference_locked ?? false,

        offer_status: scored.offer_status ?? null,
        offer_source: scored.offer_source ?? null,
        offer_locked: scored.offer_locked ?? false,

        onboarding_status: scored.onboarding_status ?? null,
        onboarding_source: scored.onboarding_source ?? null,
        onboarding_locked: scored.onboarding_locked ?? false,

        status_parsed: "success",
        status_standardized: "success",
        status_enriched: "success",
        status_compliance: scored.compliant ? "success" : "failed",
        status_scored: "success",

        last_status_changed_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return null;
  }

  const candidateRowId = data.id as string;

  // Defensive backfill for UI progress cards
  await backfillAllStatuses(candidateRowId, {
    parsed: "success",
    standardized: "success",
    enriched: "success",
    compliance: scored.compliant ? "success" : "failed",
    scored: "success",
  });

  return data as Candidate;
}
