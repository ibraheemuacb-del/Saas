import React from "react";
import "./CandidateCardNew.css";
import { CheckCircle, FileText, ArrowUp, ArrowDown } from "lucide-react";

type Variant = "operational" | "highlight" | "ai";

type OfferStatus = "draft" | "sent" | "accepted" | "rejected" | "passed" | "" | null;

type CandidateCardProps = {
  variant?: Variant;
  name: string;
  score: number;
  delta?: number;
  role: string;
  company: string;
  years: number;
  highlights: string[];
  referenceCheckPassed: boolean;
  transcriptLink?: string;
  profileImage?: string;
  cvUrl?: string;
  offerStatus?: OfferStatus;
  onReferenceCheck?: () => void;
  onDraftOffer?: () => void;
  loadingStates?: {
    reference?: boolean;
  };
};

const CandidateCardNew: React.FC<CandidateCardProps> = ({
  variant = "highlight",
  name,
  score,
  delta,
  role,
  company,
  years,
  highlights,
  referenceCheckPassed,
  transcriptLink,
  profileImage,
  cvUrl,
  offerStatus,
  onReferenceCheck,
  onDraftOffer,
  loadingStates = {},
}) => {
  const status = (offerStatus || "").toLowerCase() as OfferStatus;

  const renderOfferStatus = () => {
    if (status === "accepted") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-300">
          Offer Accepted
        </span>
      );
    }

    if (status === "rejected") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full border border-red-300">
          Offer Rejected
        </span>
      );
    }

    if (status === "sent" || status === "passed") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full border border-blue-300">
          Offer Sent
        </span>
      );
    }

    return (
      <button
        onClick={onDraftOffer}
        className="action-btn offer px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded border transition"
      >
        Draft Offer
      </button>
    );
  };

  return (
    <div className={`candidate-card-new ${variant === "ai" ? "ai-glow" : ""}`}>
      {/* HEADER */}
      <div className="candidate-header flex justify-between items-start">
        <div className="candidate-info flex gap-3">
          <img
            src={profileImage || "/default-profile.png"}
            alt={name}
            className="candidate-avatar w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="candidate-name text-base font-semibold text-gray-900">
              {name}
            </h3>
            <p className="candidate-role text-sm text-gray-600">
              {role} at {company} ({years} years)
            </p>
          </div>
        </div>

        {/* SCORE + DELTA */}
        <div className="relative">
          <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full border border-green-300">
            {score}
          </span>

          {delta !== undefined && delta !== 0 && (
            <span
              className={`absolute -top-2 -right-1 text-xs font-semibold flex items-center ${
                delta > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {delta > 0 ? (
                <ArrowUp className="w-3 h-3 mr-0.5" />
              ) : (
                <ArrowDown className="w-3 h-3 mr-0.5" />
              )}
              {Math.abs(delta)}
            </span>
          )}
        </div>
      </div>

      {/* HIGHLIGHTS */}
      <ul className="candidate-highlights mt-3 space-y-1 text-sm text-gray-800">
        {highlights.slice(0, 2).map((point, index) => (
          <li key={index} className="highlight-item">
            • {point}
          </li>
        ))}
      </ul>

      {/* FOOTER */}
      <div className="candidate-footer mt-3 space-y-2">
        {referenceCheckPassed && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-300 w-fit">
            <CheckCircle className="w-4 h-4" />
            Reference Check Passed
          </span>
        )}

        {transcriptLink && (
          <a
            href={transcriptLink}
            className="transcript-link flex items-center gap-1 text-sm hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <strong className="text-blue-600">View Interview Transcript</strong>
          </a>
        )}

        {cvUrl && (
          <a
            href={cvUrl}
            className="transcript-link flex items-center gap-1 text-sm hover:underline"
            target="_blank"
            rel="noopener noreferrer"
            download
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <strong className="text-blue-600">Download CV</strong>
          </a>
        )}
      </div>

      {/* OPERATIONAL BUTTONS */}
      {variant === "operational" && (
        <div className="action-buttons mt-4 flex gap-2 items-center">
          {!referenceCheckPassed && (
            <button
              onClick={onReferenceCheck}
              disabled={loadingStates.reference}
              className="action-btn reference px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded border transition"
            >
              {loadingStates.reference ? "Sending..." : "Reference Check"}
            </button>
          )}

          {renderOfferStatus()}
        </div>
      )}
    </div>
  );
};

export default CandidateCardNew;
