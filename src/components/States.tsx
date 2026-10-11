import React from 'react';
import { AlertCircle, RotateCcw, SearchX } from 'lucide-react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Memuat data...">
      {/* KPI Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-5 h-28 flex flex-col justify-between">
            <div className="h-3 bg-slate-200 rounded w-1/2" />
            <div className="h-7 bg-slate-300 rounded w-3/4" />
            <div className="h-2 bg-slate-100 rounded w-full" />
          </div>
        ))}
      </div>

      {/* Top 3 Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-5 h-44 flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="h-5 bg-slate-200 rounded w-1/3" />
              <div className="h-5 bg-slate-200 rounded-full w-24" />
            </div>
            <div className="h-14 bg-slate-100 rounded-lg" />
            <div className="h-4 bg-slate-200 rounded w-1/2" />
          </div>
        ))}
      </div>

      {/* Map & List Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-xl h-[560px] flex items-center justify-center">
          <span className="text-sm font-semibold text-[#64748B]">Memuat peta operasional...</span>
        </div>
        <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-xl h-[560px] p-4 space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
};

export const EmptyState: React.FC<{
  onReset: () => void;
  message?: string;
}> = ({ onReset, message = 'Tidak ada hub yang cocok dengan filter atau kata kunci pencarian.' }) => {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 sm:p-12 text-center flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-[#64748B] mb-3">
        <SearchX className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-[#0B1C30] mb-1">Hub Tidak Ditemukan</h3>
      <p className="text-xs sm:text-sm text-[#64748B] max-w-md mb-4">{message}</p>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#ED0677] text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#C80062] transition-colors cursor-pointer min-h-[44px]"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Reset Filter & Pencarian</span>
      </button>
    </div>
  );
};

export const ErrorState: React.FC<{
  onRetry: () => void;
  error?: string;
}> = ({ onRetry, error = 'Gagal memuat data metrik hub operasional.' }) => {
  return (
    <div className="bg-white border border-red-200 rounded-xl p-8 sm:p-12 text-center flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-[#0B1C30] mb-1">Terjadi Kesalahan</h3>
      <p className="text-xs sm:text-sm text-[#64748B] max-w-md mb-4">{error}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E1E24] text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-black transition-colors cursor-pointer min-h-[44px]"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Coba Lagi</span>
      </button>
    </div>
  );
};
