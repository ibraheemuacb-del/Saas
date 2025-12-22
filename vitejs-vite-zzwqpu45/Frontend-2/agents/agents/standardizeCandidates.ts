import { supabase } from "../lib/supabase";
import { standardizeCandidate } from "/agents/agents/standardize";
import { Candidate } from "../_shared/types";

export async function runStandardizationAgent() {
  console.log("🔍 Fetching raw candidates...");

  const { data: candidates, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("status", "raw");

  if (error) {
    console.error("❌ Error fetching candidates:", error);
    return;
  }

  if (!candidates || candidates.length === 0) {
    console.log("⚠️ No raw candidates found.");
    return;
  }

  console.log(`📄 Found ${candidates.length} raw candidates.`);

  for (const candidate of candidates as Candidate[]) {
    try {
      console.log(`✨ Standardizing candidate: ${candidate.name}`);

      // Transform raw candidate → standardized candidate
      const standardized = await standardizeCandidate(candidate);

      // Write standardized fields back to Supabase
      const { error: updateError } = await supabase
        .from("candidates")
        .update({
          name: standardized.name,
          role: standardized.role,
          location: standardized.location,
          experience_years: standardized.experience_years,
          skills: standardized.skills,
        })
        .eq("id", candidate.id);

      if (updateError) {
        console.error("❌ Error updating candidate:", updateError);
        continue;
      }

      // ⭐ Quick Win #1 — update status so next agent can pick it up
      const { error: statusError } = await supabase
        .from("candidates")
        .update({ status: "standardized" })
        .eq("id", candidate.id);

      if (statusError) {
        console.error("❌ Error updating status:", statusError);
        continue;
      }

      console.log(`✅ Standardized + updated status for ${candidate.name}`);
    } catch (err) {
      console.error("❌ Error processing candidate:", err);
    }
  }

  console.log("🎉 Standardization agent complete.");
}

// Allow running directly with: node standardizeCandidates.ts
runStandardizationAgent();

