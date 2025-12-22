import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { FileText } from "lucide-react";
import { Sparkles } from "lucide-react";
import { CircleCheckBig } from "lucide-react";




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
  ai_analysis?: string | null;
}

export default function TopCandidatesSection() {
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopCandidates();
  }, []);

  const loadTopCandidates = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .not("post_interview_score", "is", null)
      .order("post_interview_score", { ascending: false })
      .limit(3);

    if (error) {
      console.error("Error loading top candidates:", error);
      setLoading(false);
      return;
    }

    setCandidates(data as CandidateRecord[]);
    setLoading(false);
  };

  if (loading) return <div>Loading top candidates...</div>;
  if (!candidates.length) return <div>No candidates found.</div>;

  const aiTopPick = candidates[0];

  return (
    <section className="mt-10 w-full">
      {/* TOP 3 CANDIDATES */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Top 3 Candidates</h2>

      <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-8">
        {candidates.map((c) => {
          const score = c.post_interview_score ?? c.pre_interview_score ?? 0;

          const bullets: string[] = [];
          bullets.push(`${c.role} at ${c.company} (${c.years_experience} years)`);
          if (c.highlights) {
            bullets.push(...c.highlights.slice(0, 2));
          }

          return (
            <div
              key={c.id}
              className="relative border border-gray-200 rounded-xl p-8 bg-white shadow-sm hover:shadow-md transition min-h-[240px]"
            >
              {/* SCORE */}
              <div className="absolute top-4 right-4 px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-md">
                {score}
              </div>

              {/* IMAGE — CIRCULAR */}
              {c.profile_image_url && (
                <img
                  src={c.profile_image_url}
                  alt={c.name}
                  className="w-16 h-16 rounded-full object-cover mb-4"
                />
              )}

              {/* NAME */}
              <h3 className="text-lg font-semibold text-gray-900">{c.name}</h3>

              {/* BULLETS */}
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {bullets.map((point, idx) => (
                  <li key={idx}>• {point}</li>
                ))}
              </ul>

              {/* REFERENCE CHECK */}
              {c.reference_check_passed && (
               <span className="mt-4 inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-300">
  <CircleCheckBig className="w-4 h-4" />
  Reference Check Passed
</span>

              )}

              {/* TRANSCRIPT */}
              {c.transcript_url && (
                <a
                  href={c.transcript_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-blue-600 text-sm underline hover:text-blue-800 flex items-center gap-1"

                >
                  <FileText className="w-4 h-4" />

                  View Interview Transcript
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* AI TOP PICK */}
      <div className="mt-12 border border-gray-200 rounded-xl p-8 bg-gray-50 shadow-sm">
        {/* TITLE + ICON ABOVE IMAGE */}

        <div className="flex items-center gap-2 mb-6">
          {/* ICON PLACEHOLDER — replace with your SVG */}
          <Sparkles className="w-5 h-5 text-green-500" />

          <h3 className="text-xl font-semibold text-gray-900">AI's Top Pick</h3>
        </div>

        <div className="flex items-start gap-8">
          {/* IMAGE — SQUARE */}
          {aiTopPick.profile_image_url && (
            <div className="flex-shrink-0">
              <img
                src={aiTopPick.profile_image_url}
                alt={aiTopPick.name}
                className="w-32 h-32 rounded-md object-cover"
              />
            </div>
          )}

          {/* DETAILS */}
          <div className="flex-1">
            <p className="text-lg font-semibold text-gray-900">{aiTopPick.name}</p>

            <div className="mt-2 inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-md">
              Score: {aiTopPick.post_interview_score}
            </div>

            {/* AI ANALYSIS */}
            {aiTopPick.ai_analysis ? (
              <p className="mt-4 text-sm text-gray-700 leading-relaxed">
                {aiTopPick.ai_analysis}
              </p>
            ) : (
              <p className="mt-4 text-sm text-gray-500 italic">
                AI analysis not yet available.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
