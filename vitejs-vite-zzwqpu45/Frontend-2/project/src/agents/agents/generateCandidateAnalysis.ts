import { supabase } from "../lib/supabase"; // your backend client
import { openai } from "../lib/openai";     // your existing OpenAI wrapper

export async function generateCandidateAnalysis(candidateId: string) {
  try {
    // 1. Fetch candidate
    const { data: candidate, error: candidateError } = await supabase
      .from("candidates")
      .select("*")
      .eq("id", candidateId)
      .single();

    if (candidateError || !candidate) {
      throw new Error("Candidate not found");
    }

    // 2. Fetch transcript text if available
    let transcriptText: string | null = null;

    if (candidate.transcript_url) {
      const response = await fetch(candidate.transcript_url);
      transcriptText = await response.text();
    }

    // 3. Build prompt using your tag conventions
    const prompt = `
<CANDIDATE>
Name: ${candidate.name}
Role: ${candidate.role}
Company: ${candidate.company}
YearsExperience: ${candidate.years_experience}
PostInterviewScore: ${candidate.post_interview_score}
Highlights: ${candidate.highlights?.join(" | ") ?? "None"}
</CANDIDATE>

<TRANSCRIPT>
${transcriptText ?? "No transcript available"}
</TRANSCRIPT>

Respond ONLY with the analysis inside <AI_ANALYSIS> tags.
`;

    // 4. Generate analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const raw = completion.choices[0].message.content ?? "";

    // 5. Extract <AI_ANALYSIS>...</AI_ANALYSIS>
    const match = raw.match(/<AI_ANALYSIS>([\s\S]*?)<\/AI_ANALYSIS>/);
    const analysis = match ? match[1].trim() : raw.trim();

    // 6. Save to Supabase
    const { error: updateError } = await supabase
      .from("candidates")
      .update({ ai_analysis: analysis })
      .eq("id", candidateId);

    if (updateError) throw updateError;

    return analysis;

  } catch (error) {
    console.error("generateCandidateAnalysis failed:", error);
    throw error;
  }
}
