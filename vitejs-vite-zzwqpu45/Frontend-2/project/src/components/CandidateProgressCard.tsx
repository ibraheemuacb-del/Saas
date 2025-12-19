import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { overrideStep } from "../utils/overrides";

type Props = {
  id: string;
  name: string;
  role: string;
  offer_status: "draft" | "sent" | "accepted" | "onboarding" | "declined";
  onboarding_status: "pending" | "complete" | "n/a";
  refresh?: () => void; // 👈 allows parent list to re-fetch
};

const STAGES = [
  { key: "draft", label: "Offer draft", color: "bg-yellow-400" },
  { key: "sent", label: "Offer sent", color: "bg-orange-500" },
  { key: "accepted", label: "Accepted", color: "bg-green-300" },
  { key: "onboarding", label: "Onboarding", color: "bg-green-600" },
];

function computeStageIndex(
  offer_status: Props["offer_status"],
  onboarding_status: Props["onboarding_status"]
) {
  if (onboarding_status === "complete") return 4;
  switch (offer_status) {
    case "draft":
      return 1;
    case "sent":
      return 2;
    case "accepted":
      return 3;
    case "onboarding":
      return 4;
    default:
      return 0;
  }
}

export default function CandidateProgressCard({
  id,
  name,
  role,
  offer_status,
  onboarding_status,
  refresh,
}: Props) {
  const [localComplete, setLocalComplete] = useState(false);

  const stageIndex = useMemo(
    () => (localComplete ? 4 : computeStageIndex(offer_status, onboarding_status)),
    [offer_status, onboarding_status, localComplete]
  );

  const isComplete = stageIndex >= 4;

  async function handleComplete() {
    try {
      setLocalComplete(true);
      await overrideStep(id, "onboarding", "complete");
      if (refresh) refresh(); // 👈 trigger parent refresh
    } catch (err) {
      console.error("Automation failed:", err);
      setLocalComplete(false);
    }
  }

  return (
    <motion.div
      className={`bg-white rounded-[25px] shadow-sm border border-gray-200 p-6 w-full
                  transform transition-transform duration-300
                  ${isComplete ? "opacity-70 hover:scale-105" : "hover:scale-125 hover:shadow-lg hover:z-10"}`}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-base font-medium">{name}</h2>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
        {!isComplete && (
          <button
            onClick={handleComplete}
            className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Mark Onboarding Complete
          </button>
        )}
      </div>

      {/* Gauge */}
      <div
        className={`relative h-6 w-full ${
          isComplete ? "border-transparent" : "border border-gray-200"
        }`}
      >
        <motion.div
          className="absolute inset-0 flex gap-x-1"
          style={{ transformOrigin: "center" }}
          initial={{ scaleX: 1, opacity: 1 }}
          animate={{ scaleX: isComplete ? 0 : 1, opacity: isComplete ? 0 : 1 }}
          transition={{ delay: 0.1, duration: 1.3, ease: "easeInOut" }}
        >
          {isComplete ? (
            <div className="w-full h-full bg-green-600 rounded-full" />
          ) : (
            STAGES.map((stage, i) => {
              const filled = i + 1 <= stageIndex;
              return (
                <div key={stage.key} className="flex-1">
                  <div
                    className={`h-full rounded-sm ${
                      filled ? stage.color : "bg-gray-200"
                    }`}
                  />
                </div>
              );
            })
          )}
        </motion.div>

        {/* Tick circle */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{
            opacity: isComplete ? 1 : 0,
            scale: isComplete ? 1 : 0.6,
          }}
          transition={{ delay: 1.05, duration: 0.5, ease: "easeOut" }}
        >
          <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center shadow">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
        </motion.div>
      </div>

      {/* Labels */}
      {!isComplete && (
        <motion.div
          className="mt-3 grid grid-cols-4 w-full"
          initial={{ opacity: 1 }}
          animate={{ opacity: isComplete ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          {STAGES.map((stage, i) => {
            const index = i + 1;
            const isPast = index < stageIndex;
            const isCurrent = index === stageIndex;
            const colorClass = isPast
              ? "text-gray-400"
              : isCurrent
              ? "text-black"
              : "text-gray-300";
            return (
              <div
                key={stage.key}
                className={`text-xs font-medium ${colorClass} text-center`}
              >
                {stage.label}
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Completion text */}
      {isComplete && (
        <motion.div
          className="mt-4 text-sm font-semibold text-green-700 text-center"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.4 }}
        >
          Onboarding Complete
        </motion.div>
      )}
    </motion.div>
  );
}
