import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { overrideStep } from "../utils/overrides"; 


// ⭐ Add missing imports
import TopCandidatesSection from "../components/TopCandidatesSection";
import AITopPickCard from "../components/AITopPickCard";

interface Offer {
  id: string;
  job_id: string;
  candidate_id: string;
  status: string;
  created_at: string;
  sent_at: string | null;
  last_reply_at: string | null;
  raw_last_reply: string | null;
  intent: string | null;
  sentiment: string | null;
  metadata: any | null;
  email_template_id: string | null;
  raw_template_body: string | null;
  final_email_body: string | null;
  variables_detected: string[] | null;
  variables_replaced: Record<string, string> | null;
  edited: boolean | null;
}

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  salary_range: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
}

export default function Offers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [jobs, setJobs] = useState<Record<string, Job>>({});
  const [candidates, setCandidates] = useState<Record<string, Candidate>>({});
  const [loading, setLoading] = useState(true);

  const [buttonState, setButtonState] = useState<
    Record<string, { sending: boolean; sent: boolean }>
  >({});

  const [viewingOffer, setViewingOffer] = useState<{
    offer: Offer;
    job: Job | undefined;
    candidate: Candidate | undefined;
  } | null>(null);

  const [editingOffer, setEditingOffer] = useState<{
    offer: Offer;
    job: Job | undefined;
    candidate: Candidate | undefined;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const { data: offersData, error: offersError } = await supabase
      .from("offers")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: jobsData, error: jobsError } = await supabase
      .from("jobs")
      .select("*");

    const { data: candidatesData, error: candidatesError } = await supabase
      .from("candidates")
      .select("*");

    if (offersError) console.error("Error loading offers:", offersError);
    if (jobsError) console.error("Error loading jobs:", jobsError);
    if (candidatesError) console.error("Error loading candidates:", candidatesError);

    const jobMap: Record<string, Job> = {};
    jobsData?.forEach((j) => {
      jobMap[j.id] = j as Job;
    });

    const candidateMap: Record<string, Candidate> = {};
    candidatesData?.forEach((c) => {
      candidateMap[c.id] = c as Candidate;
    });

    setOffers((offersData as Offer[]) || []);
    setJobs(jobMap);
    setCandidates(candidateMap);
    setLoading(false);
  };

  const setButton = (offerId: string, sending: boolean, sent: boolean) => {
    setButtonState((prev) => ({
      ...prev,
      [offerId]: { sending, sent },
    }));
  };

  // ⭐ Real send-offer pipeline
  const sendOfferDraft = async (offer: Offer) => {
    const job = jobs[offer.job_id];
    const candidate = candidates[offer.candidate_id];

    if (!candidate?.email) {
      alert("Candidate is missing an email address.");
      return;
    }

    if (!job) {
      alert("Job context missing for this offer.");
      return;
    }

    const body =
      offer.final_email_body ||
      offer.raw_template_body ||
      "Offer email body is not configured yet.";

    const subject = `Offer for ${job.title}`;

    const { data, error } = await supabase.functions.invoke(
      "send-offer-email",
      {
        body: {
          to: candidate.email,
          subject,
          body,
          offer_id: offer.id,
          job_id: offer.job_id,
          candidate_id: offer.candidate_id,
        },
      }
    );

    if (error) {
      console.error("Error sending offer email:", error);
      alert("Failed to send offer email.");
      return;
    }

    const { error: updateError } = await supabase
      .from("offers")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .eq("id", offer.id);

    if (updateError) {
      console.error("Error updating offer after send:", updateError);
    }

    await loadData();
  };

  if (loading) {
    return <div className="p-6">Loading offers...</div>;
  }
return (
<div className="w-full max-w-[1600px] mx-auto py-6">








    <h1 className="text-3xl font-bold text-gray-900 mb-6">Job Offers</h1>

    {/* ⭐ Top 3 Candidates */}
    <TopCandidatesSection />

    {/* ⭐ AI's Top Pick */}
    <AITopPickCard />

    {/* Existing Offer List */}
    {offers.length === 0 ? (
      <p className="text-gray-600">No offers yet.</p>
    ) : (
      <ul className="space-y-4">
        {offers.map((offer) => {
          const job = jobs[offer.job_id];
          const candidate = candidates[offer.candidate_id];

          return (
            <li
              key={offer.id}
              className="
                bg-white rounded-xl border border-gray-200 shadow-sm p-5
                transition-all duration-200
                hover:-translate-y-[1px] hover:shadow-md hover:border-gray-300
              "
            >
              {/* Job + Candidate */}
              <h2 className="text-xl font-semibold text-gray-900">
                {job?.title || "Unknown Job"}
              </h2>

              <p className="text-gray-600">
                Candidate: {candidate?.name || "Unknown Candidate"}
              </p>

              <p className="text-gray-600">
                Email: {candidate?.email || "N/A"}
              </p>

              <p className="text-gray-600">Department: {job?.department}</p>
              <p className="text-gray-600">Location: {job?.location}</p>
              <p className="text-gray-600">Salary: {job?.salary_range}</p>

              {/* Offer Status */}
              <div className="mt-3 text-sm text-gray-500">
                Status:{" "}
                <span className="font-medium text-gray-800">
                  {offer.status}
                </span>{" "}
                • Created {new Date(offer.created_at).toLocaleString()}
              </div>

              {/* Intent + Sentiment */}
              {offer.intent && (
                <div className="mt-1 text-sm text-gray-600">
                  Intent: {offer.intent} • Sentiment: {offer.sentiment}
                </div>
              )}

              {/* ACTIONS */}
              <div className="mt-4 flex gap-3">
                {/* VIEW OFFER */}
                <button
                  onClick={() =>
                    setViewingOffer({ offer, job, candidate })
                  }
                  className="
                    px-3 py-1 text-xs rounded-[30px]
                    bg-gray-100 text-gray-800
                    hover:bg-gray-200 transition
                  "
                >
                  View Offer
                </button>

                {/* EDIT OFFER */}
                <button
                  onClick={() =>
                    setEditingOffer({ offer, job, candidate })
                  }
                  className="
                    px-3 py-1 text-xs rounded-[30px]
                    bg-yellow-100 text-yellow-800
                    hover:bg-yellow-200 transition
                  "
                >
                  Edit Offer
                </button>

                {/* SEND OFFER DRAFT */}
                <button
                  onClick={async () => {
                    setButton(offer.id, true, false);
                    await sendOfferDraft(offer);
                    setButton(offer.id, false, true);
                  }}
                  disabled={buttonState[offer.id]?.sending}
                  className="
                    px-3 py-1 text-xs rounded-[30px]
                    bg-blue-600 text-white
                    hover:bg-blue-700
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  {buttonState[offer.id]?.sending
                    ? "Sending..."
                    : buttonState[offer.id]?.sent
                    ? "Offer Sent!"
                    : "Send Offer Draft"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    )}

    {/* VIEW OFFER MODAL */}
    {viewingOffer && (
      <ViewOfferModal
        offer={viewingOffer.offer}
        job={viewingOffer.job}
        candidate={viewingOffer.candidate}
        onClose={() => setViewingOffer(null)}
      />
    )}

    {/* EDIT OFFER MODAL */}
    {editingOffer && (
      <EditOfferModal
        offer={editingOffer.offer}
        job={editingOffer.job}
        candidate={editingOffer.candidate}
        onClose={() => {
          setEditingOffer(null);
          loadData();
        }}
      />
    )}
  </div>
);

      {/* VIEW OFFER MODAL */}
      {viewingOffer && (
        <ViewOfferModal
          offer={viewingOffer.offer}
          job={viewingOffer.job}
          candidate={viewingOffer.candidate}
          onClose={() => setViewingOffer(null)}
        />
      )}

      {/* EDIT OFFER MODAL */}
      {editingOffer && (
        <EditOfferModal
          offer={editingOffer.offer}
          job={editingOffer.job}
          candidate={editingOffer.candidate}
          onClose={() => {
            setEditingOffer(null);
            loadData(); // reload to pick up saved changes
          }}
        />
      )}
    
  ;
}








/* -----------------------------------------------------------
   VIEW OFFER MODAL
----------------------------------------------------------- */

function ViewOfferModal({
  offer,
  job,
  candidate,
  onClose,
}: {
  offer: Offer;
  job?: Job;
  candidate?: Candidate;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Offer Details
        </h2>

        {/* Job Info */}
        {job && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {job.title}
            </h3>
            <p className="text-gray-600">{job.department}</p>
            <p className="text-gray-600">{job.location}</p>
            <p className="text-gray-600">{job.salary_range}</p>
          </div>
        )}

        {/* Candidate Info */}
        {candidate && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Candidate</h3>
            <p className="text-gray-600">{candidate.name}</p>
            <p className="text-gray-600">{candidate.email}</p>
          </div>
        )}

        {/* Offer Status */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Offer Status</h3>
          <p className="text-gray-700">Status: {offer.status}</p>
          {offer.intent && (
            <p className="text-gray-700">Intent: {offer.intent}</p>
          )}
          {offer.sentiment && (
            <p className="text-gray-700">Sentiment: {offer.sentiment}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            Created: {new Date(offer.created_at).toLocaleString()}
          </p>
          {offer.sent_at && (
            <p className="text-gray-500 text-sm">
              Sent: {new Date(offer.sent_at).toLocaleString()}
            </p>
          )}
        </div>

        {/* Email Preview */}
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Offer Email Preview
          </h3>
          {offer.final_email_body ? (
            <pre className="whitespace-pre-wrap text-gray-700 text-sm">
              {offer.final_email_body}
            </pre>
          ) : (
            <p className="text-gray-600 text-sm">
              No email content saved yet. Use &quot;Edit Offer&quot; to
              configure the offer email.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
   EDIT OFFER MODAL (preview → edit → save with versioning)
----------------------------------------------------------- */

function EditOfferModal({
  offer,
  job,
  candidate,
  onClose,
}: {
  offer: Offer;
  job?: Job;
  candidate?: Candidate;
  onClose: () => void;
}) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    offer.email_template_id || ""
  );
  const [emailBody, setEmailBody] = useState<string>("Loading template...");
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [loadingTemplateFile, setLoadingTemplateFile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditingBody, setIsEditingBody] = useState<boolean>(
    Boolean(offer.edited)
  );

  useEffect(() => {
    loadTemplates();
    // if we already have a final_email_body, use that as starting point
    if (offer.final_email_body) {
      setEmailBody(offer.final_email_body);
    } else {
      setEmailBody("Select a template to preview the email...");
    }
  }, []);

  const loadTemplates = async () => {
    setLoadingTemplates(true);

    const { data, error } = await supabase
      .from("knowledge_base")
      .select("*")
      .eq("type", "offer");

    if (error) {
      console.error("Error loading templates:", error);
      setLoadingTemplates(false);
      return;
    }

    setTemplates(data || []);
    setLoadingTemplates(false);

    // If no final_email_body yet but a template is already linked, load its content
    if (!offer.final_email_body && offer.email_template_id && data) {
      const existing = data.find(
        (t: any) => t.id === offer.email_template_id
      );
      if (existing) {
        setSelectedTemplate(existing.id);
        await loadTemplateFile(existing.file_path);
      }
    }
  };

  const loadTemplateFile = async (path: string) => {
    if (!path) return;
    if (!job || !candidate) {
      console.warn("Missing job or candidate context for variable replacement");
    }

    setLoadingTemplateFile(true);

    const { data, error } = await supabase.storage
      .from("knowledge_base")
      .download(path);

    if (error) {
      console.error("Error loading file:", error);
      setLoadingTemplateFile(false);
      return;
    }

    const text = await data.text();
    const populated = populateVariables(text, job, candidate);
    setEmailBody(populated);
    setLoadingTemplateFile(false);
  };

  const populateVariables = (
    template: string,
    job?: Job,
    candidate?: Candidate
  ) => {
    let result = template;

    const replacements: Record<string, string> = {
      candidate_name: candidate?.name || "",
      candidate_email: candidate?.email || "",
      job_title: job?.title || "",
      salary_range: job?.salary_range || "",
      department: job?.department || "",
      location: job?.location || "",
    };

    Object.entries(replacements).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      result = result.replace(regex, value);
    });

    return result;
  };

  const extractVariables = (template: string): string[] => {
    const regex = /{{\s*([^}]+)\s*}}/g;
    const found = new Set<string>();
    let match;
    while ((match = regex.exec(template)) !== null) {
      found.add(match[1]);
    }
    return Array.from(found);
  };

  const buildVariablesReplacedMap = (
    template: string,
    job?: Job,
    candidate?: Candidate
  ): Record<string, string> => {
    const replacements: Record<string, string> = {
      candidate_name: candidate?.name || "",
      candidate_email: candidate?.email || "",
      job_title: job?.title || "",
      salary_range: job?.salary_range || "",
      department: job?.department || "",
      location: job?.location || "",
    };

    const vars = extractVariables(template);
    const used: Record<string, string> = {};
    vars.forEach((v) => {
      if (replacements[v] !== undefined) {
        used[v] = replacements[v];
      }
    });
    return used;
  };

  const handleTemplateChange = async (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      await loadTemplateFile(template.file_path);
      setIsEditingBody(false); // back to preview mode when switching template
    }
  };

  const saveOffer = async () => {
    setSaving(true);

    // We don't yet store raw template in knowledge_base, so use final body to derive variables.
    const baseText = offer.raw_template_body || emailBody;

    const variablesDetected = extractVariables(baseText);
    const variablesReplaced = buildVariablesReplacedMap(
      baseText,
      job,
      candidate
    );

    const { error } = await supabase
      .from("offers")
      .update({
        email_template_id: selectedTemplate || offer.email_template_id,
        raw_template_body: baseText,
        final_email_body: emailBody,
        variables_detected: variablesDetected,
        variables_replaced: variablesReplaced,
        edited: isEditingBody || offer.edited || false,
      })
      .eq("id", offer.id);

    setSaving(false);

    if (error) {
      console.error("Failed to save offer:", error);
      alert("Failed to save offer");
      return;
    }

    onClose();
  };

  const currentTemplateTitle =
    templates.find((t) => t.id === selectedTemplate)?.title || "None selected";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative animate-fadeIn">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Edit Offer Email
        </h2>

        {/* Context */}
        <div className="mb-4 text-sm text-gray-600">
          <div>
            <span className="font-medium text-gray-800">Job:</span>{" "}
            {job?.title || "Unknown Job"}
          </div>
          <div>
            <span className="font-medium text-gray-800">Candidate:</span>{" "}
            {candidate?.name || "Unknown Candidate"} (
            {candidate?.email || "N/A"})
          </div>
        </div>

        {/* Template selector */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Template
        </label>

        {loadingTemplates ? (
          <p className="text-gray-500 text-sm mb-4">Loading templates...</p>
        ) : (
          <select
            value={selectedTemplate}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 mb-4 text-sm"
          >
            <option value="">Choose a template...</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        )}

        <div className="mb-2 text-xs text-gray-500">
          Current template:{" "}
          <span className="font-medium">{currentTemplateTitle}</span>
        </div>

        {/* Email preview / editor */}
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            {isEditingBody ? "Email Body (editable)" : "Email Preview"}
          </label>

          <button
            type="button"
            onClick={() => setIsEditingBody((prev) => !prev)}
            className="text-xs px-2 py-1 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            {isEditingBody ? "View as read-only" : "Edit email"}
          </button>
        </div>

        {loadingTemplateFile ? (
          <div className="border border-gray-200 rounded-lg p-4 text-sm text-gray-500">
            Loading template content...
          </div>
        ) : isEditingBody ? (
          <textarea
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            className="w-full h-64 border border-gray-300 rounded-lg p-3 text-sm"
          />
        ) : (
          <div className="w-full h-64 border border-gray-200 rounded-lg p-3 text-sm bg-gray-50 overflow-auto whitespace-pre-wrap text-gray-800">
            {emailBody || "Select a template to preview the email..."}
          </div>
        )}

        {/* Save */}
        <button
          onClick={saveOffer}
          disabled={saving}
          className="
            mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white
            hover:bg-blue-700 transition disabled:opacity-50
          "
        >
          {saving ? "Saving..." : "Save Offer"}
        </button>
      </div>
    </div>
  );
}
