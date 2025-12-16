// supabase/functions/onboard/index.ts
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

    const canOnboard = candidate.offer_status === "drafted";

    const { error: updateErr } = await supabase
      .from("candidates")
      .update({ onboarding_status: canOnboard ? "started" : "blocked" })
      .eq("id", candidateId);
    if (updateErr) throw updateErr;

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "onboard failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
