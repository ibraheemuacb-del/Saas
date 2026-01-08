import { supabase } from "../../lib/supabase";
import { useCandidateStore } from "../../stores/candidateStore";
import { addTimelineEvent } from "../../lib/api/timeline";
import { triggerAutomations } from "../automationEngine";

type Candidate = {
  id: string;
  stage: string;
  name?: string;
  [key: string]: any;
};

type TransitionOptions = {
  reason?: string;
  triggerAutomations?: boolean;
};

export async function transitionCandidateStage(
  candidate: Candidate,
  toStage: string,
  options: TransitionOptions = {}
): Promise<Candidate | null> {
  const { id: candidateId, stage: fromStage } = candidate;
  const { reason, triggerAutomations: shouldTrigger = true } = options;

  const store = useCandidateStore.getState();

  // ⭐ Mark candidate as loading
  store.setLoadingState(candidateId, true);

  // ⭐ Optimistic UI update (unchanged)
  const optimistic = { ...candidate, stage: toStage };
  store.updateCandidate(candidateId, optimistic);

  const { data, error } = await supabase
    .from("candidates")
    .update({
      stage: toStage,
      last_status_changed_at: new Date().toISOString(),
    })
    .eq("id", candidateId)
    .select("*")
    .single();

  // ⭐ Clear loading state
  store.setLoadingState(candidateId, false);

  if (error || !data) {
    console.error("Stage transition failed:", error?.message);

    // Rollback to original
    store.updateCandidate(candidateId, candidate);

    return null;
  }

  // ⭐ Timeline event (unchanged)
  await addTimelineEvent({
    candidate_id: candidateId,
    type: "stage_transition",
    payload: {
      from: fromStage,
      to: toStage,
      reason,
    },
  });

  // ⭐ Trigger automations (unchanged)
  if (shouldTrigger) {
    await triggerAutomations({
      candidate_id: candidateId,
      stage: toStage,
    });
  }

  // ⭐ Use new safer merge/insert method
  store.replaceOrInsertCandidate(data);

  return data;
}
