// src/engine/candidateOfferEngine.ts

import { supabase } from "../lib/supabase";
import { addTimelineEvent } from "./timelineEngine";
import { logAudit } from "./auditEngine";
import { updateStage } from "./stageEngine";
import { getCandidate } from "./candidateEngine";

export type CandidateOfferStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "withdrawn";

export interface CandidateOffer {
  id: string;
  candidate_id: string;
  status: CandidateOfferStatus;
  salary: number | null;
  start_date: string | null;
  notes: string | null;
  content: string | null;
  locked: boolean;
  created_at: string;
  updated_at: string;
}

/* -------------------------------------------------------
 * FETCH OFFER FOR CANDIDATE
 * ----------------------------------------------------- */
export async function fetchOfferForCandidate(
  candidateId: string
): Promise<CandidateOffer | null> {
  const { data, error } = await supabase
    .from("candidate_offers")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("fetchOfferForCandidate error:", error);
    return null;
  }

  return (data as CandidateOffer) ?? null;
}

/* -------------------------------------------------------
 * CREATE OFFER DRAFT
 * ----------------------------------------------------- */
export async function createOfferDraft(params: {
  candidateId: string;
  content?: string | null;
  salary?: number | null;
  startDate?: string | null;
  notes?: string | null;
}): Promise<CandidateOffer | null> {
  const { candidateId, content, salary, startDate, notes } = params;

  const { data, error } = await supabase
    .from("candidate_offers")
    .insert({
      candidate_id: candidateId,
      status: "draft",
      content: content ?? null,
      salary: salary ?? null,
      start_date: startDate ?? null,
      notes: notes ?? null,
      locked: false,
    })
    .select("*")
    .single();

  if (error) {
    console.error("createOfferDraft error:", error);
    return null;
  }

  // Log timeline + audit
  await addTimelineEvent(candidateId, "offer_drafted", { offerId: data.id });
  await logAudit(candidateId, "offer_drafted", { offerId: data.id });

  return data as CandidateOffer;
}

/* -------------------------------------------------------
 * UPDATE OFFER DRAFT
 * ----------------------------------------------------- */
export async function updateOfferDraft(
  offerId: string,
  updates: {
    content?: string | null;
    salary?: number | null;
    startDate?: string | null;
    notes?: string | null;
  }
): Promise<CandidateOffer | null> {
  // Fetch existing
  const { data: existing, error: fetchError } = await supabase
    .from("candidate_offers")
    .select("*")
    .eq("id", offerId)
    .maybeSingle();

  if (fetchError || !existing) {
    console.error("updateOfferDraft fetch error:", fetchError);
    return null;
  }

  if (existing.locked) {
    console.warn("updateOfferDraft: offer is locked", offerId);
    return null;
  }

  const { content, salary, startDate, notes } = updates;

  const { data, error } = await supabase
    .from("candidate_offers")
    .update({
      content: content ?? existing.content,
      salary:
        typeof salary === "number" || salary === null
          ? salary
          : existing.salary,
      start_date: startDate ?? existing.start_date,
      notes: notes ?? existing.notes,
    })
    .eq("id", offerId)
    .select("*")
    .single();

  if (error) {
    console.error("updateOfferDraft error:", error);
    return null;
  }

  return data as CandidateOffer;
}

/* -------------------------------------------------------
 * SEND OFFER (DB UPDATE ONLY)
 * ----------------------------------------------------- */
export async function sendOffer(offerId: string): Promise<CandidateOffer | null> {
  const { data: existing, error: fetchError } = await supabase
    .from("candidate_offers")
    .select("*")
    .eq("id", offerId)
    .maybeSingle();

  if (fetchError || !existing) {
    console.error("sendOffer fetch error:", fetchError);
    return null;
  }

  const { data, error } = await supabase
    .from("candidate_offers")
    .update({
      status: "sent",
      locked: true,
    })
    .eq("id", offerId)
    .select("*")
    .single();

  if (error) {
    console.error("sendOffer update error:", error);
    return null;
  }

  // Log timeline + audit
  await addTimelineEvent(existing.candidate_id, "offer_sent", { offerId });
  await logAudit(existing.candidate_id, "offer_sent", { offerId });

  // Update stage
  const candidate = await getCandidate(existing.candidate_id);
  await updateStage(candidate, "offer_sent");

  return data as CandidateOffer;
}

/* -------------------------------------------------------
 * LOCK OFFER
 * ----------------------------------------------------- */
export async function lockOffer(offerId: string): Promise<CandidateOffer | null> {
  const { data, error } = await supabase
    .from("candidate_offers")
    .update({
      locked: true,
    })
    .eq("id", offerId)
    .select("*")
    .single();

  if (error) {
    console.error("lockOffer error:", error);
    return null;
  }

  return data as CandidateOffer;
}

/* -------------------------------------------------------
 * UPDATE OFFER STATUS (accepted, rejected, withdrawn)
 * ----------------------------------------------------- */
export async function updateOfferStatus(params: {
  offerId: string;
  status: CandidateOfferStatus;
}): Promise<CandidateOffer | null> {
  const { offerId, status } = params;

  const { data: existing, error: fetchError } = await supabase
    .from("candidate_offers")
    .select("*")
    .eq("id", offerId)
    .maybeSingle();

  if (fetchError || !existing) {
    console.error("updateOfferStatus fetch error:", fetchError);
    return null;
  }

  const { data, error } = await supabase
    .from("candidate_offers")
    .update({ status })
    .eq("id", offerId)
    .select("*")
    .single();

  if (error) {
    console.error("updateOfferStatus update error:", error);
    return null;
  }

  // Timeline + audit
  await addTimelineEvent(existing.candidate_id, "offer_status_changed", {
    offerId,
    status,
  });

  await logAudit(existing.candidate_id, "offer_status_changed", {
    offerId,
    status,
  });

  // Stage transitions
  const candidate = await getCandidate(existing.candidate_id);

  if (status === "accepted") {
    await updateStage(candidate, "offer_accepted");
  }

  return data as CandidateOffer;
}
