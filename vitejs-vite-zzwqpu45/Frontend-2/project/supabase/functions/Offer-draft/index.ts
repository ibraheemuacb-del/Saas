// supabase/functions/offer-draft/index.ts
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  try {
    const { candidateId } = await req.json();

    const { data: candidate, error } = await supabase
      .from("candidates")
      .select("*")
      .eq("id", candidateId)
      .single();
    if (error) throw error;

    const canDraft = candidate.reference_status === "passed";

    const { error: updateErr } = await supabase
      .from("candidates")
      .update({ offer_status: canDraft ? "drafted" : "blocked" })
      .eq("id", candidateId);
    if (updateErr) throw updateErr;

    if (canDraft) {
      const functionsBase = Deno.env.get("BASE_FUNCTIONS_URL");
      if (functionsBase) {
        await fetch(`${functionsBase}/onboard`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ candidateId }),
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "offer-draft failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
