import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { InvalidRecords } from './pages/InvalidRecords';

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<'dashboard' | 'invalid-records'>('dashboard');
  const [invalidCount, setInvalidCount] = useState<number>(891);

  useEffect(() => {
    fetch('/data/invalid_records.json')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setInvalidCount(data.length);
        }
      })
      .catch(() => {});
  }, []);

  // Sync route with URL hash if present
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'invalid-records') {
        setCurrentRoute('invalid-records');
      } else {
        setCurrentRoute('dashboard');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleRouteChange = (route: 'dashboard' | 'invalid-records') => {
    setCurrentRoute(route);
    window.location.hash = route === 'invalid-records' ? 'invalid-records' : '';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#0B1C30]">
      {/* Top Application Header */}
      <Header
        currentRoute={currentRoute}
        onRouteChange={handleRouteChange}
        invalidCount={invalidCount}
      />

      {/* Main Content Area */}
      <div className="flex-1">
        {currentRoute === 'dashboard' ? (
          <Dashboard />
        ) : (
          <InvalidRecords onBackToDashboard={() => handleRouteChange('dashboard')} />
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-[#E5E7EB] bg-white py-6">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0B1C30]">Anteraja Hub Dwell Monitor</span>
            <span>&bull;</span>
            <span>Dashboard Operasional Logistik</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleRouteChange('invalid-records')}
              className="hover:text-[#ED0677] transition-colors cursor-pointer"
            >
              Audit Data Tidak Valid
            </button>
            <span>&bull;</span>
            <span>OpenStreetMap &copy; Kontributor</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
