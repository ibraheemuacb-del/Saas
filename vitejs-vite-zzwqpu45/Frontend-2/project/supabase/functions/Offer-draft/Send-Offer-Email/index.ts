// supabase/functions/Send-Offer-Email/index.ts

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type SendOfferPayload = {
  to: string;
  subject: string;
  body: string;
  offer_id?: string;
  job_id?: string;
  candidate_id?: string;
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("OFFER_FROM_EMAIL") || "offers@yourdomain.com";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY env var");
    return new Response(
      JSON.stringify({ error: "Server email config not set" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let payload: SendOfferPayload;

  try {
    payload = await req.json();
  } catch (e) {
    console.error("Invalid JSON payload:", e);
    return new Response(
      JSON.stringify({ error: "Invalid JSON payload" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { to, subject, body, offer_id, job_id, candidate_id } = payload;

  if (!to || !subject || !body) {
    return new Response(
      JSON.stringify({
        error: "Missing required fields: to, subject, body",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Send email via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html: body,
      }),
    });

    const resendJson = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend error:", resendJson);
      return new Response(
        JSON.stringify({
          error: "Failed to send email",
          provider_error: resendJson,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        provider: "resend",
        provider_id: resendJson.id,
        offer_id,
        job_id,
        candidate_id,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error sending offer email:", err);
    return new Response(
      JSON.stringify({ error: "Unexpected error sending email" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
