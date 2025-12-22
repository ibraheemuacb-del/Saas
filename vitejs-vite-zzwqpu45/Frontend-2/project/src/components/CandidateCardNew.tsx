import React from "react";
import "./CandidateCardNew.css";

type CandidateCardProps = {
  name: string;
  score: number;
  delta?: number; // optional score delta
  role: string;
  company: string;
  years: number;
  highlights: string[];
  referenceCheckPassed: boolean;
  transcriptLink?: string;
  profileImage?: string; // optional profile picture
};

const CandidateCardNew: React.FC<CandidateCardProps> = ({
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
}) => {
  return (
    <div className="candidate-card-new">

      {/* TOP ROW: Profile + Name + Score */}
      <div className="candidate-header">
        <div className="candidate-info">
          <img
            src={profileImage || "/default-profile.png"}
            alt={name}
            className="candidate-avatar"
          />
          <div>
            <h3 className="candidate-name">{name}</h3>
            <p className="candidate-role">
              {role} at {company} ({years} years)
            </p>
          </div>
        </div>

        <div className="candidate-score">
          <span className="score-number">{score}</span>

          {/* Delta only if provided and non-zero */}
          {delta !== undefined && delta !== 0 && (
            <span className={`score-delta ${delta > 0 ? "up" : "down"}`}>
              {delta > 0 ? `+${delta} ↑` : `${delta} ↓`}
            </span>
          )}
        </div>
      </div>

      {/* BULLET POINTS */}
      <ul className="candidate-highlights">
        {highlights.map((point, index) => (
          <li key={index} className="highlight-item">
            • {point}
          </li>
        ))}
      </ul>

      {/* BADGES + LINKS */}
      <div className="candidate-footer">
        {referenceCheckPassed && (
          <div className="reference-badge">
            <span className="badge-icon">✔</span>
            Reference Check Passed
          </div>
        )}

        {transcriptLink && (
          <a
            href={transcriptLink}
            className="transcript-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="transcript-icon">📄</span>
            View Interview Transcript
          </a>
        )}
      </div>
    </div>
  );
};

export default CandidateCardNew;
