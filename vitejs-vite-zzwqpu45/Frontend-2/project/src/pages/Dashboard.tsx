import { Link } from 'react-router-dom';
import { Briefcase, Users, FileText, UserCheck } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { label: 'Active Jobs', value: '12', icon: Briefcase, link: '/jobs', color: 'blue' },
    { label: 'Candidates', value: '48', icon: Users, link: '/candidates', color: 'green' },
    { label: 'Pending Offers', value: '8', icon: FileText, link: '/offers', color: 'purple' },
    { label: 'Onboarding', value: '5', icon: UserCheck, link: '/onboarding', color: 'orange' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to your recruitment command center</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              to={stat.link}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                  <Icon className={`h-8 w-8 text-${stat.color}-600`} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">New candidate applied</p>
                <p className="text-sm text-gray-600">Sarah Johnson - Senior Developer</p>
              </div>
              <span className="text-xs text-gray-500">2m ago</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Offer accepted</p>
                <p className="text-sm text-gray-600">Michael Chen - Product Manager</p>
              </div>
              <span className="text-xs text-gray-500">1h ago</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Interview scheduled</p>
                <p className="text-sm text-gray-600">Emma Davis - UX Designer</p>
              </div>
              <span className="text-xs text-gray-500">3h ago</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/add-job"
              className="block w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition text-center"
            >
              Post New Job
            </Link>
            <Link
              to="/candidates"
              className="block w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 transition text-center"
            >
              Review Candidates
            </Link>
            <Link
              to="/offers"
              className="block w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 transition text-center"
            >
              Draft Offers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
