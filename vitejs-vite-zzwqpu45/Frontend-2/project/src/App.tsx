import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import AddJob from './pages/AddJob';
import Jobs from './pages/Jobs';
import Candidates from './pages/Candidates';
import Offers from './pages/Offers';
import Onboarding from './pages/Onboarding';
import KnowledgeUpload from './pages/knowledgeupload'; // ✅ import your new page

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-job" element={<AddJob />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* ✅ New route for Knowledge Base Upload */}
            <Route path="/knowledgeupload" element={<KnowledgeUpload />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
