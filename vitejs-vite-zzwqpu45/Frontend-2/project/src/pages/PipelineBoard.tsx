import { useEffect, useState } from "react";
import { DndContext, DragEndEvent, DragMoveEvent } from "@dnd-kit/core";
import { supabase } from "../lib/supabase";
import { STAGES } from "../lib/stages";
import PipelineColumn from "../components/Pipeline/PipelineColumn";
import { CandidateDetailDrawer } from "../components/CandidateDetail/CandidateDetailDrawer";
import { useCandidateStore } from "../stores/candidateStore";

export default function PipelineBoard() {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const candidates = useCandidateStore((state) => state.candidates);
  const mergeCandidates = useCandidateStore((state) => state.mergeCandidates);

  useEffect(() => {
    fetchCandidates();
  }, []);

  async function fetchCandidates() {
    const { data } = await supabase.from("candidates").select("*");
    if (data) {
      useCandidateStore.getState().setCandidates(data);
    }
  }

  function openCandidate(candidate) {
    setSelectedCandidate(candidate);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setSelectedCandidate(null);
  }

  // ⭐ Auto-scroll when dragging near edges
  function handleDragMove(event: DragMoveEvent) {
    const SCROLL_SPEED = 18;
    const edgeThreshold = 120;

    const container = document.querySelector(".pipeline-scroll-container");
    if (!container) return;

    const { clientX } = event.delta;

    const rect = container.getBoundingClientRect();

    if (clientX < rect.left + edgeThreshold) {
      container.scrollLeft -= SCROLL_SPEED;
    } else if (clientX > rect.right - edgeThreshold) {
      container.scrollLeft += SCROLL_SPEED;
    }
  }

  // ⭐ DRAG & DROP HANDLER
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const candidate = active.data.current?.candidate;
    const newStage = over.id;

    if (!candidate || candidate.stage === newStage) return;

    // 1. Instant UI update
    mergeCandidates([{ ...candidate, stage: newStage }]);

    // 2. Update Supabase
    await supabase
      .from("candidates")
      .update({ stage: newStage })
      .eq("id", candidate.id);

    // 3. Timeline event
    await supabase.from("timeline").insert({
      candidate_id: candidate.id,
      type: "stage_change",
      from_stage: candidate.stage,
      to_stage: newStage,
      created_at: new Date().toISOString(),
    });

    // 4. Update drawer if open
    if (selectedCandidate?.id === candidate.id) {
      setSelectedCandidate({ ...candidate, stage: newStage });
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd} onDragMove={handleDragMove}>
      <div className="pipeline-scroll-container flex gap-4 overflow-x-auto scroll-smooth p-4">

        {STAGES.map((stage) => {
          const stageCandidates = candidates.filter((c) => c.stage === stage);

          return (
            <div key={stage} className="flex flex-col min-w-[320px]">

              {/* ⭐ COLUMN HEADER WITH COUNT */}
              <div className="flex items-center justify-between mb-2 px-1">
                <h2 className="text-sm font-semibold text-slate-800">
                  {stage}
                </h2>

                <span className="inline-flex items-center justify-center text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {stageCandidates.length}
                </span>
              </div>

              {/* ⭐ COLUMN BODY (PipelineColumn still renders cards) */}
              <PipelineColumn
                stage={stage}
                candidates={stageCandidates}
                onOpen={openCandidate}
                isEmpty={stageCandidates.length === 0} // ⭐ NEW
              />

            </div>
          );
        })}

        <CandidateDetailDrawer
          candidate={selectedCandidate}
          open={drawerOpen}
          onClose={closeDrawer}
        />
      </div>
    </DndContext>
  );
}
