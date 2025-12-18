import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { postToJobBoards } from "../../../agents/agents/jobPoster/jobPoster";
import { ingestCv } from "../../../agents/agents/cvingester/cvingester";

export default function AddJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    salary_range: "",
    description: "",
  });

  const handleSubmit = async (status: "Draft" | "Published") => {
    setLoading(true);
    try {
      // Step 1: Insert job into Supabase
      const { data, error } = await supabase
        .from("jobs")
        .insert([{ ...formData, status }])
        .select();

      if (error) throw error;

      const jobId = data?.[0]?.id;

      // Step 2: If Published, trigger external posting + CV ingestion
      if (status === "Published" && jobId) {
        await postToJobBoards({
          id: jobId,
          title: formData.title,
          department: formData.department,
          location: formData.location,
          salary_range: formData.salary_range,
          description: formData.description,
          status,
        });

        // Simulate CV ingestion (runs all agents: parse, standardize, enrich, compliance, score)
        await ingestCv(jobId, { name: "Jane Doe", role: "Software Engineer" });
        await ingestCv(jobId, { name: "John Smith", role: "Frontend Developer" });

        console.log("Automation pipeline triggered: job posted + CVs ingested.");
      }

      // ✅ Navigate back to jobs list after success
      navigate("/jobs");
    } catch (error) {
      console.error("Error creating job:", error);
      alert("Failed to create job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Add Job</h1>
        <p className="mt-2 text-gray-600">
          Create a new job posting for your organization
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Job Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="e.g. Senior Software Engineer"
                required
              />
            </div>

            <div>
              <label
                htmlFor="department"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Department
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="e.g. Engineering"
                required
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="e.g. San Francisco, CA (Remote)"
                required
              />
            </div>

            <div>
              <label
                htmlFor="salary_range"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Salary Range
              </label>
              <input
                type="text"
                id="salary_range"
                name="salary_range"
                value={formData.salary_range}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="e.g. $120,000 - $180,000"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Job Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              placeholder="Provide a detailed description of the role, responsibilities, and requirements..."
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleSubmit("Draft")}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Draft"}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("Published")}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? "Publishing..." : "Publish Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
