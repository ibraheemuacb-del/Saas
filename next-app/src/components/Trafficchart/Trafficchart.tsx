import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { supabase } from "../../lib/supabase";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

type SourceKey = "linkedin" | "indeed" | "referral";

export default function TrafficChart() {
  const [sourceCounts, setSourceCounts] = useState({
    linkedin: 0,
    indeed: 0,
    referral: 0,
  });

  const [eventCounts, setEventCounts] = useState({
    screening_passed: 0,
    interview_completed: 0,
    offer_sent: 0,
    offer_accepted: 0,
    onboarding_complete: 0,
  });

  // Helper to calculate percentages
  const calcPercent = (value: number, total: number) => {
    if (total === 0) return "0%";
    return `${Math.round((value / total) * 100)}%`;
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: candidates } = await supabase
        .from("candidates")
        .select("cand_source");

      if (candidates) {
        const counts = { linkedin: 0, indeed: 0, referral: 0 };
        candidates.forEach((row: { cand_source: string | null }) => {
          const src = row.cand_source?.toLowerCase() as SourceKey;
          if (src && counts[src] !== undefined) {
            counts[src]++;
          }
        });
        setSourceCounts(counts);
      }

      const { data: events } = await supabase
        .from("candidate_events")
        .select("event_type");

      if (events) {
        const counts = {
          screening_passed: 0,
          interview_completed: 0,
          offer_sent: 0,
          offer_accepted: 0,
          onboarding_complete: 0,
        };

        events.forEach((row: { event_type: string }) => {
          const type = row.event_type as keyof typeof counts;
          if (counts[type] !== undefined) {
            counts[type]++;
          }
        });

        setEventCounts(counts);
      }
    };

    fetchData();
  }, []);

  // Totals for percentages
  const totalSources =
    sourceCounts.linkedin + sourceCounts.indeed + sourceCounts.referral;

  const totalPipeline =
    eventCounts.screening_passed +
    eventCounts.interview_completed +
    eventCounts.offer_sent +
    eventCounts.offer_accepted +
    eventCounts.onboarding_complete;

  const trafficDonutData = {
    labels: ["LinkedIn", "Indeed", "Referral"],
    datasets: [
      {
        data: [
          sourceCounts.linkedin,
          sourceCounts.indeed,
          sourceCounts.referral,
        ],
        backgroundColor: ["#3b82f6", "#10b981", "#8b5cf6"],
        borderWidth: 1,
      },
    ],
  };

  const pipelineDonutData = {
    labels: ["Screened", "Interviewed", "Offer", "Hired"],
    datasets: [
      {
        data: [
          eventCounts.screening_passed,
          eventCounts.interview_completed,
          eventCounts.offer_sent + eventCounts.offer_accepted,
          eventCounts.onboarding_complete,
        ],
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="w-full flex justify-center">
      <div className="flex flex-row gap-6">

        {/* Candidate Sources */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center w-64
        transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <h3 className="text-md font-semibold mb-3">Candidate Sources</h3>

          <div className="w-40 h-40 ring-1 ring-gray-200 rounded-full
          transition-all duration-300 hover:ring-2 hover:ring-blue-300">
            <Doughnut
              data={trafficDonutData}
              options={{
                plugins: { legend: { display: false } },
                cutout: "65%",
                animation: { duration: 800, easing: "easeOutQuart" },
              }}
            />
          </div>

          <div className="mt-6 w-full flex flex-col items-center space-y-2">
            {[
              { label: "LinkedIn", color: "#3b82f6", value: sourceCounts.linkedin },
              { label: "Indeed", color: "#10b981", value: sourceCounts.indeed },
              { label: "Referral", color: "#8b5cf6", value: sourceCounts.referral },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between w-48">
                <div className="flex items-center space-x-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {calcPercent(item.value, totalSources)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline Stage */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center w-64
        transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <h3 className="text-md font-semibold mb-3">Pipeline Stage</h3>

          <div className="w-40 h-40 ring-1 ring-gray-200 rounded-full
          transition-all duration-300 hover:ring-2 hover:ring-blue-300">
            <Doughnut
              data={pipelineDonutData}
              options={{
                plugins: { legend: { display: false } },
                cutout: "65%",
                animation: { duration: 800, easing: "easeOutQuart" },
              }}
            />
          </div>

          <div className="mt-6 w-full flex flex-col items-center space-y-2">
            {[
              { label: "Screened", color: "#3b82f6", value: eventCounts.screening_passed },
              { label: "Interviewed", color: "#10b981", value: eventCounts.interview_completed },
              { label: "Offer", color: "#f59e0b", value: eventCounts.offer_sent + eventCounts.offer_accepted },
              { label: "Hired", color: "#8b5cf6", value: eventCounts.onboarding_complete },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between w-48">
                <div className="flex items-center space-x-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {calcPercent(item.value, totalPipeline)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
