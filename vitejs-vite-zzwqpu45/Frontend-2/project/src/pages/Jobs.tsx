import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, Eye, MoreVertical } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  status: 'active' | 'paused' | 'closed' | null;
  created_at: string;
  indeed_url: string | null;
  linkedin_url: string | null;
  internal_url: string | null;
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const [openViewMenu, setOpenViewMenu] = useState<string | null>(null);
  const [openStatusMenu, setOpenStatusMenu] = useState<string | null>(null);

  const viewMenuRef = useRef<HTMLDivElement | null>(null);
  const statusMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (viewMenuRef.current && !viewMenuRef.current.contains(event.target as Node)) {
        setOpenViewMenu(null);
      }
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setOpenStatusMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const safeJobs: Job[] = (data || []).map((job: any) => ({
        ...job,
        status: (job.status ?? 'active') as Job['status'],
      }));

      const statusOrder: Record<'active' | 'paused' | 'closed', number> = {
        active: 0,
        paused: 1,
        closed: 2,
      };

      const sorted = safeJobs.sort((a, b) => {
        const aStatus = (a.status ?? 'active') as 'active' | 'paused' | 'closed';
        const bStatus = (b.status ?? 'active') as 'active' | 'paused' | 'closed';
        return statusOrder[aStatus] - statusOrder[bStatus];
      });

      setJobs(sorted);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (job: Job, newStatus: 'active' | 'paused' | 'closed') => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', job.id);

      if (error) throw error;
      fetchJobs();
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Failed to update job status');
    }
  };

  const deleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      const { error } = await supabase.from('jobs').delete().eq('id', id);

      if (error) throw error;
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job');
    }
  };

  const statusBadge = (status: Job['status']) => {
    const s = status ?? 'active';
    const styles: Record<'active' | 'paused' | 'closed', string> = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-gray-200 text-gray-700',
    };
    return styles[s];
  };

  const toggleViewMenu = (id: string) => {
    setOpenViewMenu(openViewMenu === id ? null : id);
    setOpenStatusMenu(null);
  };

  const toggleStatusMenu = (id: string) => {
    setOpenStatusMenu(openStatusMenu === id ? null : id);
    setOpenViewMenu(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
          <p className="mt-2 text-gray-600">Manage all your job listings</p>
        </div>
        <Link
          to="/add-job"
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
        >
          Add New Job
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-visible relative z-0">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{job.department}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{job.location}</td>

                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-lg ${statusBadge(job.status)}`}>
                    {job.status}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                  <div className="flex justify-end gap-2">

                    {/* VIEW MENU */}
                    <button
                      onClick={() => toggleViewMenu(job.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    {openViewMenu === job.id && (
                      <div
                        ref={viewMenuRef}
                        className="absolute right-20 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                      >
                        <button
                          disabled={!job.indeed_url}
                          onClick={() => job.indeed_url && window.open(job.indeed_url, '_blank')}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            job.indeed_url ? 'hover:bg-gray-100 text-gray-800' : 'text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          View on Indeed
                        </button>

                        <button
                          disabled={!job.linkedin_url}
                          onClick={() => job.linkedin_url && window.open(job.linkedin_url, '_blank')}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            job.linkedin_url ? 'hover:bg-gray-100 text-gray-800' : 'text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          View on LinkedIn
                        </button>

                        <button
                          disabled={!job.internal_url}
                          onClick={() => job.internal_url && window.open(job.internal_url, '_blank')}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            job.internal_url ? 'hover:bg-gray-100 text-gray-800' : 'text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          View Internal Page
                        </button>
                      </div>
                    )}

                    {/* EDIT */}
                    <Link
                      to={`/edit-job/${job.id}`}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Link>

                    {/* DELETE */}
                    <button
                      onClick={() => deleteJob(job.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {/* STATUS MENU */}
                    <button
                      onClick={() => toggleStatusMenu(job.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {openStatusMenu === job.id && (
                      <div
                        ref={statusMenuRef}
                        className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                      >
                        {job.status === 'active' && (
                          <>
                            <button
                              onClick={() => updateStatus(job, 'paused')}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            >
                              Pause Job
                            </button>
                            <button
                              onClick={() => updateStatus(job, 'closed')}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            >
                              Close Job
                            </button>
                          </>
                        )}

                        {job.status === 'paused' && (
                          <>
                            <button
                              onClick={() => updateStatus(job, 'active')}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            >
                              Resume Job
                            </button>
                            <button
                              onClick={() => updateStatus(job, 'closed')}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            >
                              Close Job
                            </button>
                          </>
                        )}

                        {job.status === 'closed' && (
                          <span className="block px-4 py-2 text-sm text-gray-400">Job Closed</span>
                        )}
                      </div>
                    )}

                  </div>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
