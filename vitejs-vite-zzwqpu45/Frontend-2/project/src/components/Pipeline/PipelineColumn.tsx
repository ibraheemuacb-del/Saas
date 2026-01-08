import { useDroppable, useDraggable } from "@dnd-kit/core";
import CandidateCardNew from "../CandidateCardNew";
import { GripVertical } from "lucide-react";

interface PipelineColumnProps {
  stage: string;
  candidates: any[];
  onOpen: (candidate: any) => void;
}

export default function PipelineColumn({
  stage,
  candidates,
  onOpen,
}: PipelineColumnProps) {
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: stage });

  const isEmpty = candidates.length === 0; // ⭐ NEW

  return (
    <div
      ref={setDropRef}
      data-stage={stage}
      className={`w-80 rounded-lg p-4 flex-shrink-0 border transition-all ${
        isOver ? "bg-blue-50 border-blue-300 shadow-md" : "bg-gray-50 border-gray-200"
      }`}
    >
      <h2 className="text-lg font-semibold mb-4 capitalize flex items-center justify-between">
        {stage}

        {/* ⭐ COLUMN HEADER COUNT */}
        <span className="inline-flex items-center justify-center text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {candidates.length}
        </span>
      </h2>

      {/* ⭐ EMPTY STATE VISUAL */}
      {isEmpty ? (
        <div className="flex-1 flex items-center justify-center">
          <div
            className="
              text-center 
              px-3 py-4 
              rounded-md 
              border border-dashed border-slate-300 
              bg-white 
              text-xs text-slate-500
            "
          >
            No candidates in this stage.
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {candidates.map((candidate) => (
            <DraggableCandidate
              key={candidate.id}
              candidate={candidate}
              onOpen={onOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DraggableCandidate({
  candidate,
  onOpen,
}: {
  candidate: any;
  onOpen: (candidate: any) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: candidate.id,
    data: { candidate },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
        position: "relative",
        opacity: isDragging ? 0.85 : 1,
        transition: "transform 0.12s ease-out",
      }
    : { transition: "transform 0.12s ease-out" };

  return (
    <div ref={setNodeRef} style={style} className="transition-all hover:scale-[1.01]">
      <div className="flex items-stretch gap-2">
        <button
          type="button"
          {...listeners}
          {...attributes}
          className="flex items-center justify-center px-1 text-gray-400 hover:text-gray-600 cursor-grab"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="flex-1" onClick={() => onOpen(candidate)}>
          <CandidateCardNew
            variant="operational"
            name={candidate.name}
            role={candidate.role}
            company={candidate.company}
            years={candidate.years_experience}
            score={
              candidate.post_interview_score ??
              candidate.pre_interview_score ??
              0
            }
            delta={
              candidate.post_interview_score &&
              candidate.pre_interview_score
                ? candidate.post_interview_score -
                  candidate.pre_interview_score
                : undefined
            }
            highlights={candidate.highlights ?? []}
            referenceCheckPassed={candidate.reference_status === "passed"}
            transcriptLink={candidate.transcript_url ?? undefined}
            profileImage={candidate.profile_image_url ?? undefined}
            cvUrl={candidate.cv_file_path}
            offerStatus={candidate.offer_status}
          />
        </div>
      </div>
    </div>
  );
}
