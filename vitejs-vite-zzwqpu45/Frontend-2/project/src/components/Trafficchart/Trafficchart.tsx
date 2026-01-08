import { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { useCandidateStore } from "../../stores/candidateStore";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function TrafficChart() {
  const candidates = useCandidateStore((s) => s.candidates);

  // Count candidate sources
  const sourceCounts = useMemo(() => {
    const counts = { linkedin: 0, indeed: 0, referral: 0 };

    candidates.forEach((c) => {
      const src = c.cand_source?.toLowerCase();
      if (src && counts[src] !== undefined) {
        counts[src]++;
      }
    });

    return counts;
  }, [candidates]);

  // Count pipeline stages
  const pipelineCounts = useMemo(() => {
    const counts = {
      screened: 0,
      interviewed: 0,
      offer: 0,
      hired: 0,
    };

    candidates.forEach((c) => {
      switch (c.stage) {
        case "screening":
          counts.screened++;
          break;
        case "interview":
          counts.interviewed++;
          break;
        case "offer":
          counts.offer++;
          break;
        case "offer_accepted":
          counts.hired++;
          break;
      }
    });

    return counts;
  }, [candidates]);

  // Helper to calculate percentages
  const calcPercent = (value: number, total: number) => {
    if (total === 0) return "0%";
    return `${Math.round((value / total) * 100)}%`;
  };

  const totalSources =
    sourceCounts.linkedin + sourceCounts.indeed + sourceCounts.referral;

  const totalPipeline =
    pipelineCounts.screened +
    pipelineCounts.interviewed +
    pipelineCounts.offer +
    pipelineCounts.hired;

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
          pipelineCounts.screened,
          pipelineCounts.interviewed,
          pipelineCounts.offer,
          pipelineCounts.hired,
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
              { label: "Screened", color: "#3b82f6", value: pipelineCounts.screened },
              { label: "Interviewed", color: "#10b981", value: pipelineCounts.interviewed },
              { label: "Offer", color: "#f59e0b", value: pipelineCounts.offer },
              { label: "Hired", color: "#8b5cf6", value: pipelineCounts.hired },
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
