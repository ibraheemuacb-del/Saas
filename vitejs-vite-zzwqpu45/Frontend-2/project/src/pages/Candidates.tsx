import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Candidate {
  id: string;
  name: string;
  role: string;
  pre_interview_score: number;
  post_interview_score: number;
  rating: string;
  reference_status: string;
  offer_status: string;
  onboarding_status: string;
}

export default function Candidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();

    // 🔄 realtime subscription
    const channel = supabase
      .channel('candidates-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'candidates' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAutomation = async (route: string, candidateId: string) => {
    try {
      const res = await fetch(
        `https://awqqvtrouljkwxjqmgzh.supabase.co/functions/v1/${route}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateId }),
        }
      );
      if (!res.ok) throw new Error(`${route} automation failed`);
      const data = await res.json();
      console.log(`${route} result:`, data);
      // realtime subscription will auto-update statuses
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading candidates...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Candidate Pipeline</h1>
        <p className="mt-2 text-gray-600">Review and manage all candidates</p>
      </div>

      {candidates.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-600">No candidates found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <h3 className="font-bold text-gray-900">{candidate.name}</h3>
              <p className="text-sm text-gray-600">{candidate.role}</p>

              <div className="flex gap-2 mt-4 mb-4">
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-lg bg-green-100 text-green-800">
                  Pre: {candidate.pre_interview_score ?? '-'}
                </span>
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-lg bg-blue-100 text-blue-800">
                  Post: {candidate.post_interview_score ?? '-'}
                </span>
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-800">
                  Rating: {candidate.rating}
                </span>
              </div>

              <div className="space-y-1 text-sm mb-4">
                <p>Reference: {candidate.reference_status}</p>
                <p>Offer: {candidate.offer_status}</p>
                <p>Onboarding: {candidate.onboarding_status}</p>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => runAutomation('reference-check', candidate.id)}
                  className="px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700"
                >
                  Reference Check
                </button>
                <button
                  onClick={() => runAutomation('offer-draft', candidate.id)}
                  className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Offer Draft
                </button>
                <button
                  onClick={() => runAutomation('onboard', candidate.id)}
                  className="px-3 py-1 text-xs rounded bg-purple-600 text-white hover:bg-purple-700"
                >
                  Onboard
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
