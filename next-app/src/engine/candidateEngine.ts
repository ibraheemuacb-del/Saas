import { supabase } from "../lib/supabase";
import type { Candidate } from "../lib/types";

export async function getCandidate(candidateId: string): Promise<Candidate> {
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", candidateId)
    .single();

  if (error) throw error;
  return data as Candidate;
}
