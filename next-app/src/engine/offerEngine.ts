import { supabase } from "../lib/supabase";
import { addTimelineEvent } from "./timelineEngine";
import { logAudit } from "./auditEngine";
import { updateStage } from "./stageEngine";
import { getCandidate } from "./candidateEngine";

/**
 * Called when an offer draft is created (before sending).
 */
export async function logOfferDraft(candidateId: string, draftId: string) {
  await addTimelineEvent(candidateId, "offer_drafted", { draftId });
  await logAudit(candidateId, "offer_drafted", { draftId });
}

/**
 * Called when an offer is officially sent.
 */
export async function sendOffer(candidateId: string, offerId: string) {
  const candidate = await getCandidate(candidateId);

  // Log timeline + audit
  await addTimelineEvent(candidateId, "offer_sent", { offerId });
  await logAudit(candidateId, "offer_sent", { offerId });

  // Update stage → offer_sent
  await updateStage(candidate, "offer_sent");
}

/**
 * Called when candidate accepts the offer.
 */
export async function acceptOffer(candidateId: string, offerId: string) {
  const candidate = await getCandidate(candidateId);

  // Log timeline + audit
  await addTimelineEvent(candidateId, "offer_accepted", { offerId });
  await logAudit(candidateId, "offer_accepted", { offerId });

  // Update stage → offer_accepted (this triggers onboarding automatically)
  await updateStage(candidate, "offer_accepted");
}
