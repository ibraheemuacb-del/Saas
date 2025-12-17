import { supabase } from "../lib/supabase";

export async function overrideStep(
  candidateId: string,
  step: "reference" | "offer" | "onboarding",
  value: string
) {
  const field = {
    reference: "reference_status",
    offer: "offer_status",
    onboarding: "onboarding_status",
  }[step];

  const sourceField = {
    reference: "reference_source",
    offer: "offer_source",
    onboarding: "onboarding_source",
  }[step];

  const lockField = {
    reference: "reference_locked",
    offer: "offer_locked",
    onboarding: "onboarding_locked",
  }[step];

  const update = {
    [field]: value,
    [sourceField]: "manual",
    [lockField]: true,
    last_status_changed_at: new Date().toISOString(),
  };

  // Update candidate record
  const { error: updateError } = await supabase
    .from("candidates")
    .update(update)
    .eq("id", candidateId);

  if (updateError) {
    console.error("Candidate update failed:", updateError);
    return;
  }

  // Insert audit event
  const { error: eventError } = await supabase.from("candidate_events").insert({
    candidate_id: candidateId,
    event_type: `${step}_${value}`,
    source: "manual",
    meta: { ui: "dashboard_button" },
  });

  if (eventError) {
    console.error("Event insert failed:", eventError);
  }
}
