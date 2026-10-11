import React from 'react';
import { AlertCircle, LayoutDashboard } from 'lucide-react';

interface HeaderProps {
  currentRoute: 'dashboard' | 'invalid-records';
  onRouteChange: (route: 'dashboard' | 'invalid-records') => void;
  invalidCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ currentRoute, onRouteChange, invalidCount = 0 }) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] shadow-xs">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#ED0677] to-[#C80062] flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-[#0B1C30] tracking-tight">
                Hub Dwell Monitor
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Navigasi Utama">
          <button
            type="button"
            onClick={() => onRouteChange('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors min-h-[44px] cursor-pointer ${
              currentRoute === 'dashboard'
                ? 'bg-[#1E1E24] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0B1C30] hover:bg-[#F8F9FA]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => onRouteChange('invalid-records')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors min-h-[44px] cursor-pointer ${
              currentRoute === 'invalid-records'
                ? 'bg-[#1E1E24] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0B1C30] hover:bg-[#F8F9FA]'
            }`}
          >
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Data Tidak Valid</span>
            {invalidCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                {invalidCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
