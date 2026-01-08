import { create } from "zustand";

interface Candidate {
  id: string;
  stage: string;
  [key: string]: any;
}

interface CandidateStore {
  candidates: Candidate[];

  // Replace all candidates (initial fetch)
  setCandidates: (list: Candidate[]) => void;

  // Merge or insert a single candidate
  updateCandidate: (id: string, data: Candidate) => void;

  // Merge a batch of candidates (prevents stale overwrites)
  mergeCandidates: (incoming: Candidate[]) => void;

  // Remove a candidate
  removeCandidate: (id: string) => void;

  // ⭐ NEW: Per-candidate loading states
  loadingStates: Record<string, boolean>;
  setLoadingState: (id: string, isLoading: boolean) => void;

  // ⭐ NEW: Replace or insert (used by realtime + sync)
  replaceOrInsertCandidate: (candidate: Candidate) => void;

  // ⭐ NEW: Bulk replace (future multi-job support)
  bulkReplace: (list: Candidate[]) => void;
}

export const useCandidateStore = create<CandidateStore>((set, get) => ({
  candidates: [],

  loadingStates: {}, // ⭐ NEW

  setLoadingState: (id, isLoading) =>
    set((state) => ({
      loadingStates: { ...state.loadingStates, [id]: isLoading },
    })),

  setCandidates: (list) => {
    // Deduplicate by ID
    const unique = Array.from(new Map(list.map((c) => [c.id, c])).values());
    set({ candidates: unique });
  },

  updateCandidate: (id, data) => {
    const current = get().candidates;

    const exists = current.some((c) => c.id === id);

    if (!exists) {
      // Insert new candidate
      set({ candidates: [...current, data] });
      return;
    }

    // Merge update
    const updated = current.map((c) =>
      c.id === id ? { ...c, ...data } : c
    );

    set({ candidates: updated });
  },

  mergeCandidates: (incoming) =>
    set((state) => {
      const map = new Map(state.candidates.map((c) => [c.id, c]));

      incoming.forEach((c) => {
        map.set(c.id, { ...map.get(c.id), ...c });
      });

      return { candidates: Array.from(map.values()) };
    }),

  removeCandidate: (id) => {
    const filtered = get().candidates.filter((c) => c.id !== id);
    set({ candidates: filtered });
  },

  // ⭐ NEW: Replace or insert candidate (used by realtime + syncCandidate)
  replaceOrInsertCandidate: (candidate) =>
    set((state) => {
      const exists = state.candidates.some((c) => c.id === candidate.id);

      if (!exists) {
        return { candidates: [...state.candidates, candidate] };
      }

      return {
        candidates: state.candidates.map((c) =>
          c.id === candidate.id ? { ...c, ...candidate } : c
        ),
      };
    }),

  // ⭐ NEW: Bulk replace (future multi-job support)
  bulkReplace: (list) => {
    const unique = Array.from(new Map(list.map((c) => [c.id, c])).values());
    set({ candidates: unique });
  },
}));
