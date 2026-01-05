import { supabase } from "../../lib/supabase";
import type { StageKey } from "./types";

const stageColumns: Record<StageKey, string> = {
  parsed: "status_parsed",
  standardized: "status_standardized",
  enriched: "status_enriched",
  compliance: "status_compliance",
  scored: "status_scored",
};

export async function markStageStatus(
  stage: StageKey,
  status: "pending" | "success" | "failed",
  context: {
    candidateRowId?: string;
    job_id?: string;
    detail?: string;
    payload?: any;
  }
) {
  await supabase.from("audit_logs").insert([
    {
      stage,
      status,
      detail: context.detail ?? null,
      job_id: context.job_id ?? null,
      candidate_id: context.candidateRowId ?? null,
      payload: context.payload ?? null,
    },
  ]);

  if (context.candidateRowId) {
    await supabase
      .from("candidates")
      .update({ [stageColumns[stage]]: status })
      .eq("id", context.candidateRowId);
  }
}

export async function backfillAllStatuses(
  candidateRowId: string,
  statuses: Partial<Record<StageKey, "pending" | "success" | "failed">>
) {
  const update: Record<string, string> = {};
  Object.entries(statuses).forEach(([stage, status]) => {
    if (!status) return;
    update[stageColumns[stage as StageKey]] = status;
  });

  if (Object.keys(update).length > 0) {
    await supabase.from("candidates").update(update).eq("id", candidateRowId);
  }
}

export async function runStage<T>(
  stage: StageKey,
  fn: () => Promise<T> | T,
  context: { candidateRowId?: string; job_id?: string; detail?: string; payload?: any }
): Promise<{ ok: true; result: T } | { ok: false; error: any }> {
  await markStageStatus(stage, "pending", context);
  try {
    const result = await fn();
    await markStageStatus(stage, "success", { ...context, payload: result });
    return { ok: true, result };
  } catch (error) {
    await markStageStatus(stage, "failed", { ...context, detail: String(error) });
    return { ok: false, error };
  }
}
