import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { overrideStep } from "../utils/overrides";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  salary_range: string;
  description: string;
  status: string;
  created_at: string;
}

export default function Offers() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track button state per job
  const [buttonState, setButtonState] = useState<
    Record<string, { sending: boolean; sent: boolean }>
  >({});

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
        console.error("Supabase error:", error.message);
      } else {
        setJobs(data || []);
      }
      setLoading(false);
    };

    fetchJobs();
  }, []);

  const setButton = (
    jobId: string,
    step: string,
    sending: boolean,
    sent: boolean
  ) => {
    setButtonState((prev) => ({
      ...prev,
      [`${jobId}-${step}`]: { sending, sent },
    }));
  };

  if (loading) {
    return <div className="p-6">Loading jobs...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Job Offers</h1>

      {jobs.length === 0 ? (
        <p className="text-gray-600">No jobs found. Try adding one!</p>
      ) : (
        <ul className="space-y-4">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <h2 className="text-xl font-semibold text-gray-800">
                {job.title}
              </h2>
              <p className="text-gray-600">{job.department}</p>
              <p className="text-gray-600">{job.location}</p>
              <p className="text-gray-600">{job.salary_range}</p>
              <p className="mt-2 text-gray-700">{job.description}</p>
              <div className="mt-2 text-sm text-gray-500">
                Status: {job.status} • Created{" "}
                {new Date(job.created_at).toLocaleString()}
              </div>

              {/* ✅ Manual override button for Offer Draft */}
              <div className="mt-3">
                <button
                  onClick={async () => {
                    setButton(job.id, "offer", true, false);
                    await overrideStep(job.id, "offer", "sent");
                    setButton(job.id, "offer", false, true);
                  }}
                  disabled={buttonState[`${job.id}-offer`]?.sending}
                  className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {buttonState[`${job.id}-offer`]?.sending
                    ? "Sending..."
                    : buttonState[`${job.id}-offer`]?.sent
                    ? "Offer Sent!"
                    : "Send Offer Draft"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
