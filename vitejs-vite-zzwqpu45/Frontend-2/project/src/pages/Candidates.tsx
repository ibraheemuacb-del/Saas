import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { callEdgeFunction } from "../utils/edgeFunctions";
import CandidateCardNew from "../components/CandidateCardNew";
import { useNavigate } from "react-router-dom";

interface Candidate {
  id: string;
  name: string;
  role: string;
  company: string;
  years_experience: number;

  pre_interview_score: number;
  post_interview_score: number;

  highlights: string[] | null;

  reference_status: string;
  reference_locked: boolean;

  transcript_url: string | null;
  profile_image_url: string | null;
  cv_file_path?: string;

  offer_status: string;
  onboarding_status: string;
}

export default function Candidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  const [buttonState, setButtonState] = useState<
    Record<string, { sending: boolean; sent: boolean }>
  >({});

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("candidates-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "candidates" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  const setButton = (
    candidateId: string,
    step: string,
    sending: boolean,
    sent: boolean
  ) => {
    setButtonState((prev) => ({
      ...prev,
      [`${candidateId}-${step}`]: { sending, sent },
    }));
  };

  const handleDraftOffer = (candidate: Candidate) => {
    navigate("/offers/draft", {
      state: {
        candidateId: candidate.id,
        candidateName: candidate.name,
        role: candidate.role,
        company: candidate.company,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading candidates...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Candidate Pipeline</h1>
        <p className="mt-2 text-gray-600">Review and manage all candidates</p>
      </div>

      {candidates.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-600">No candidates found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((c) => {
            const score = c.post_interview_score ?? c.pre_interview_score ?? 0;
            const delta =
              c.post_interview_score && c.pre_interview_score
                ? c.post_interview_score - c.pre_interview_score
                : undefined;

            const cvUrl = c.cv_file_path
              ? supabase.storage.from("cvs").getPublicUrl(c.cv_file_path).data
                  .publicUrl
              : undefined;

            return (
              <CandidateCardNew
                key={c.id}
                variant="operational"
                name={c.name}
                score={score}
                delta={delta}
                role={c.role}
                company={c.company}
                years={c.years_experience}
                highlights={c.highlights ?? []}
                referenceCheckPassed={c.reference_status === "passed"}
                transcriptLink={c.transcript_url ?? undefined}
                profileImage={c.profile_image_url ?? undefined}
                cvUrl={cvUrl}
                offerStatus={c.offer_status}
                loadingStates={{
                  reference: buttonState[`${c.id}-reference`]?.sending,
                }}
                onReferenceCheck={async () => {
                  setButton(c.id, "reference", true, false);
                  await callEdgeFunction(c.id, "reference", "passed");
                  setButton(c.id, "reference", false, true);
                }}
                onDraftOffer={() => handleDraftOffer(c)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
