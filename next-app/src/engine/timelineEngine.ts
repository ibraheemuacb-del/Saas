import { supabase } from "../lib/supabase";

export type TimelineEvent = {
  id?: string;
  candidate_id: string;
  type: string;
  payload: any;
  created_at?: string;
};

/**
 * Adds a timeline event for a candidate.
 * This is called by stage changes, offer flow, rejection flow, scoring, onboarding, etc.
 */
export async function addTimelineEvent(
  candidateId: string,
  type: string,
  payload: any = {}
) {
  const event: TimelineEvent = {
    candidate_id: candidateId,
    type,
    payload,
  };

  const { error } = await supabase.from("timeline").insert(event);

  if (error) throw error;

  return event;
}

/**
 * Fetch all timeline events for a candidate, sorted newest → oldest.
 */
export async function getTimeline(candidateId: string) {
  const { data, error } = await supabase
    .from("timeline")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data as TimelineEvent[];
}
