import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { fetchOfferTemplate, fillPlaceholders } from "../utils/templates";
import { callEdgeFunction } from "../utils/edgeFunctions";
import { supabase } from "../lib/supabase";

interface LocationState {
  candidateId: string;
  candidateName: string;
  role?: string;
  company?: string;
  startDate?: string;
  salary?: string;
  managerName?: string;
}

const OfferDraftPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | undefined;

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "Loading template...",
  });

  if (!state?.candidateId) {
    return (
      <div className="p-6">
        <p className="text-gray-600">No candidate selected for offer draft.</p>
      </div>
    );
  }

  const {
    candidateId,
    candidateName,
    role,
    company,
    startDate,
    salary,
    managerName,
  } = state;

  useEffect(() => {
    if (editor) {
      loadTemplate();
    }
  }, [editor]);

  const loadTemplate = async () => {
    const template = await fetchOfferTemplate("Standard Offer Letter");

    if (!template) {
      editor?.commands.setContent("Error loading template.");
      setLoading(false);
      return;
    }

    const filled = fillPlaceholders(template, {
      candidate_name: candidateName,
      role: role || "",
      company: company || "",
      start_date: startDate || "TBD",
      salary: salary || "",
      manager_name: managerName || "",
    });

    editor?.commands.setContent(filled);
    setLoading(false);
  };

  const handleSendOffer = async () => {
    if (!editor) return;

    try {
      setSending(true);

      const html = editor.getHTML();

      await supabase.from("offers").insert({
        candidate_id: candidateId,
        content: html,
        status: "sent",
      });

      await callEdgeFunction(candidateId, "offer", "sent");

      navigate("/candidates");
    } catch (err) {
      console.error("Error sending offer:", err);
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500 text-sm">
        Loading offer template...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Draft Offer</h1>

      <div className="mb-4 text-sm text-gray-700 leading-relaxed">
        <p>
          <span className="font-medium">Candidate:</span> {candidateName}
          {role && company && (
            <span className="text-gray-600">
              {" "}
              — {role} at {company}
            </span>
          )}
        </p>
      </div>

      <div className="border rounded-md bg-white p-4 mb-6 shadow-sm transition-all min-h-[300px]">
        <EditorContent editor={editor} />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate("/candidates")}
          className="px-4 py-2 text-sm rounded border border-gray-300 bg-white hover:bg-gray-50 transition"
          disabled={sending}
        >
          Cancel
        </button>

        <button
          onClick={handleSendOffer}
          disabled={sending}
          className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition"
        >
          {sending ? "Sending Offer..." : "Send Offer"}
        </button>
      </div>
    </div>
  );
};

export default OfferDraftPage;
