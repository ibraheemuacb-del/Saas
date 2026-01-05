import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { callEdgeFunction } from "../utils/edgeFunctions";

interface LocationState {
  candidateId: string;
  candidateName: string;
  role?: string;
  company?: string;
}

const OfferDraftPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | undefined;

  const [sending, setSending] = useState(false);

  if (!state?.candidateId) {
    return (
      <div className="p-6">
        <p className="text-gray-600">No candidate selected for offer draft.</p>
      </div>
    );
  }

  const { candidateId, candidateName, role, company } = state;

  const handleSendOffer = async () => {
    try {
      setSending(true);
      await callEdgeFunction(candidateId, "offer", "sent");
      navigate("/candidates");
    } catch (error) {
      console.error("Error sending offer:", error);
      setSending(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Draft Offer</h1>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-1">Candidate</p>
        <p className="text-base font-medium text-gray-900">
          {candidateName}
          {role && company && (
            <span className="text-gray-600">
              {" "}
              — {role} at {company}
            </span>
          )}
        </p>
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">
          Offer preview (from your knowledge base templates with placeholders
          filled in) would be rendered here.
        </p>
        <div className="border rounded-md p-4 bg-white text-sm text-gray-800 min-h-[160px]">
          <p>
            Dear {candidateName},
            <br />
            <br />
            We are pleased to offer you the position of{" "}
            {role || "[Role]"} at {company || "[Company]"}. This section will be
            fully generated from your knowledge base templates with all
            placeholders replaced.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate("/candidates")}
          className="px-4 py-2 text-sm rounded border border-gray-300 bg-white hover:bg-gray-50"
          disabled={sending}
        >
          Cancel
        </button>
        <button
          onClick={handleSendOffer}
          disabled={sending}
          className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {sending ? "Sending Offer..." : "Send Offer"}
        </button>
      </div>
    </div>
  );
};

export default OfferDraftPage;
