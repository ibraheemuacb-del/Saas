import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';


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

  useEffect(() => {
    console.log("Offers component mounted");
    console.log("Supabase URL from env:", import.meta.env.VITE_SUPABASE_URL);
    console.log("About to query jobs table...");

    const fetchJobs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        console.error("Supabase error:", error.message);
      } else {
        setJobs(data || []);
        console.log("Jobs data from Supabase:", data);
      }
      setLoading(false);
    };

    fetchJobs();
  }, []);

  // 🔄 Test function to hit backend loop
  const handleTestOfferDraft = async () => {
    const testCandidate = {
      id: '123',
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'Software Engineer',
    };

    try {
      const response = await fetch('/api/offer-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCandidate),
      });

      const data = await response.json();
      console.log('Backend response:', data);
      alert(`Backend says: ${data.message}`);
    } catch (err) {
      console.error('Error sending offer draft:', err);
      alert('Error sending offer draft');
    }
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

      {/* 🔄 Test button for backend loop */}
      <button
        onClick={handleTestOfferDraft}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Test Offer Draft → Backend
      </button>

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
                Status: {job.status} • Created{' '}
                {new Date(job.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
