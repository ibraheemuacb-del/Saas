import { supabase } from "../../lib/supabase";
import { useCandidateStore } from "../../stores/candidateStore";
import { syncCandidate } from "../sync/syncCandidate";

export function subscribeToCandidateRealtime() {
  const store = useCandidateStore.getState();

  const channel = supabase
    .channel("candidates-realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "candidates",
      },
      async (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload;

        // ⭐ INSERT → add new candidate to store
        if (eventType === "INSERT" && newRow) {
          store.replaceOrInsertCandidate(newRow); // NEW
          return;
        }

        // ⭐ UPDATE → hydrate from DB to avoid stale UI
        if (eventType === "UPDATE" && newRow) {
          // Mark loading for smoother UI
          store.setLoadingState(newRow.id, true); // NEW

          await syncCandidate(newRow.id);

          store.setLoadingState(newRow.id, false); // NEW
          return;
        }

        // ⭐ DELETE → remove from store
        if (eventType === "DELETE" && oldRow) {
          store.removeCandidate(oldRow.id);
          return;
        }
      }
    )
    .subscribe();

  return channel;
}
