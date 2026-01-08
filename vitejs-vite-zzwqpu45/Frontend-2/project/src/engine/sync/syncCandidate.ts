import { supabase } from "../../lib/supabase";
import { useCandidateStore } from "../../stores/candidateStore";

export async function syncCandidate(candidateId: string) {
  if (!candidateId) return null;

  const store = useCandidateStore.getState();

  // ⭐ Mark candidate as loading
  store.setLoadingState(candidateId, true);

  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", candidateId)
    .single();

  // ⭐ Clear loading state
  store.setLoadingState(candidateId, false);

  if (error) {
    console.error("Failed to sync candidate:", error.message);
    return null;
  }

  if (!data) return null;

  // ⭐ Use new safer merge/insert method
  store.replaceOrInsertCandidate(data);

  return data;
}
