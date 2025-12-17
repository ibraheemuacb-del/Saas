import React, { useState } from "react";
import { supabase } from "../../supabase/client"; // ✅ fixed path
import { overrideStep } from "../utils/overrides"; // import your helper
import { CheckCircle, Circle, Calendar } from "lucide-react";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleOnboardingOverride() {
    setSending(true);
    // Here we mark onboarding as complete
    await overrideStep("candidate-id-placeholder", "onboarding", "complete");
    setSending(false);
    setSent(true);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Onboarding</h1>

      <div className="space-y-4">
        <button onClick={() => setStep(1)} className="flex items-center space-x-2">
          {step === 1 ? <CheckCircle /> : <Circle />}
          <span>Step 1: Profile Setup</span>
        </button>

        <button onClick={() => setStep(2)} className="flex items-center space-x-2">
          {step === 2 ? <CheckCircle /> : <Circle />}
          <span>Step 2: Document Upload</span>
        </button>

        <button onClick={() => setStep(3)} className="flex items-center space-x-2">
          {step === 3 ? <CheckCircle /> : <Circle />}
          <span>Step 3: Schedule Interview</span>
        </button>
      </div>

      <div className="mt-6">
        {step === 1 && <p>Fill out your profile details here.</p>}
        {step === 2 && <p>Upload your resume and other documents here.</p>}
        {step === 3 && (
          <p>
            Use the <Calendar className="inline-block" /> to pick a date for your interview.
          </p>
        )}
      </div>

      {/* ✅ Manual override button */}
      <div className="mt-6">
        <button
          onClick={handleOnboardingOverride}
          disabled={sending}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? "Sending..." : sent ? "Onboarding Complete!" : "Mark Onboarding Complete"}
        </button>
      </div>
    </div>
  );
}
