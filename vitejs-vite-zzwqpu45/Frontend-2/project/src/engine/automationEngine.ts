import type { Stage } from "../lib/stages";
import { useCandidateStore } from "../stores/candidateStore";
import { supabase } from "../lib/supabase";

// ⭐ Future automation modules (email, notifications, scoring, etc.)
async function runAutomationModules(payload: any) {
  // Placeholder for future expansion
  console.log("Running automation modules:", payload);

  // Example: notify client, send email, update score, etc.
  // await sendClientNotification(payload);
  // await updateCandidateScore(payload);
  // await triggerWebhook(payload);
}

export async function triggerAutomationOnStageChange(
  candidateId: string,
  from: Stage,
  to: Stage
) {
  console.log("Automation on stage change:", { candidateId, from, to });

  const store = useCandidateStore.getState();

  // ⭐ Mark automation as loading for this candidate
  store.setLoadingState(candidateId, true);

  // ⭐ Fetch fresh candidate data (ensures automations use latest info)
  const { data: candidate } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", candidateId)
    .single();

  // ⭐ Clear loading state
  store.setLoadingState(candidateId, false);

  if (!candidate) {
    console.warn("Automation skipped — candidate not found:", candidateId);
    return;
  }

  // ⭐ Run automation modules (extensible)
  await runAutomationModules({
    candidate,
    candidateId,
    from,
    to,
    triggered_at: new Date().toISOString(),
  });

  console.log("Automation completed for candidate:", candidateId);
}
