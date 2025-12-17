// utils/edgeFunctions.ts

/**
 * Call a Supabase Edge Function for candidate pipeline updates.
 *
 * @param candidateId - UUID of the candidate
 * @param step - Which stage to update ("reference" | "offer" | "onboarding")
 * @param result - Status value ("pending" | "passed" | "failed")
 */
export async function callEdgeFunction(
  candidateId: string,
  step: "reference" | "offer" | "onboarding",
  result: "pending" | "passed" | "failed"
) {
  try {
    const response = await fetch(
      `https://awqqvtrouljkwxjqmgzh.supabase.co/functions/v1/${step}-check`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Use anon key from your Vite environment variables
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ candidateId, result })
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Function ${step}-check failed: ${response.status} ${response.statusText} - ${text}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Edge function call error:", error);
    throw error;
  }
}
