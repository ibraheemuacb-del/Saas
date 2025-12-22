import React, { useEffect, useState } from "react";
import CandidateCardNew from "./CandidateCardNew";
import { supabase } from "../lib/supabase";

interface AITopPickRecord {
  candidate_id: string;
  reasoning: string;
}

interface CandidateRecord {
  id: string;
  name: string;
  role: string;
  company: string;
  years_experience: number;
  pre_interview_score: number | null;
  post_interview_score: number | null;
  reference_check_passed: boolean;
  transcript_url: string | null;
  profile_image_url: string | null;
  highlights: string[] | null;
}

export default function AITopPickCard() {
  const [candidate, setCandidate] = useState<CandidateRecord | null>(null);
  const [reasoning, setReasoning] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAITopPick();
  }, []);

  const loadAITopPick = async () => {
    setLoading(true);

    const { data: aiData, error: aiError } = await supabase
      .from("ai_top_pick")
      .select("*")
      .single();

    if (aiError || !aiData) {
      console.error("Error loading AI top pick:", aiError);
      setLoading(false);
      return;
    }

    setReasoning(aiData.reasoning);

    const { data: candidateData, error: candidateError } = await supabase
      .from("candidates")
      .select("*")
      .eq("id", aiData.candidate_id)
      .single();

    if (candidateError) {
      console.error("Error loading AI top pick candidate:", candidateError);
      setLoading(false);
      return;
    }

    setCandidate(candidateData as CandidateRecord);
    setLoading(false);
  };

  if (loading) return <div>Loading AI Top Pick...</div>;
  if (!candidate) return null;

  const score =
    candidate.post_interview_score ?? candidate.pre_interview_score ?? 0;

  const delta =
    candidate.pre_interview_score && candidate.post_interview_score
      ? candidate.post_interview_score - candidate.pre_interview_score
      : undefined;

  return (
    <div style={{ marginTop: "40px" }}>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">AI's Top Pick</h2>

      <CandidateCardNew
        name={candidate.name}
        score={score}
        delta={delta}
        role={candidate.role}
        company={candidate.company}
        years={candidate.years_experience}
        highlights={candidate.highlights || []}
        referenceCheckPassed={candidate.reference_check_passed}
        transcriptLink={candidate.transcript_url || undefined}
        profileImage={candidate.profile_image_url || undefined}
      />

      <div className="ai-reasoning-box">
        <p className="ai-reasoning-text">{reasoning}</p>
      </div>
    </div>
  );
}
