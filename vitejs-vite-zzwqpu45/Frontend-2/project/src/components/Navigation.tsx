import { Link, useLocation } from 'react-router-dom';
import { Briefcase, Users, FileText, UserCheck, Home, BookOpen } from 'lucide-react'; 
// ✅ Added BookOpen icon for Knowledge Base

export default function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/add-job', label: 'Add Job', icon: Briefcase },
    { path: '/jobs', label: 'Jobs', icon: FileText },
    { path: '/candidates', label: 'Candidates', icon: Users },
    { path: '/offers', label: 'Offers', icon: FileText },
    { path: '/onboarding', label: 'Onboarding', icon: UserCheck },
    { path: '/knowledgeupload', label: 'Knowledge Base', icon: BookOpen }, // ✅ New nav item
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Briefcase className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">RecruitPro</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition ${
                      isActive(item.path)
                        ? 'text-green-600 bg-green-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="sm:hidden border-t border-gray-200">
        <div className="flex overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-1 inline-flex flex-col items-center px-2 py-2 text-xs font-medium transition ${
                  isActive(item.path)
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
