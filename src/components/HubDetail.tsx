import React, { useEffect } from 'react';
import {
  X,
  MapPin,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  PackageCheck,
  PackageOpen,
  AlertCircle,
  TrendingUp,
  ArrowLeft,
} from 'lucide-react';
import {
  formatIndonesianNumber,
  formatInteger,
  type MergedHub,
} from '../lib/metrics/dwell';
import { getPriority, PRIORITY_META } from '../config/priority';

interface HubDetailProps {
  hub: MergedHub;
  onClose: () => void;
  isMobileModal?: boolean;
}

export const HubDetail: React.FC<HubDetailProps> = ({
  hub,
  onClose,
  isMobileModal = false,
}) => {
  const priority = getPriority(hub.avg_dwell_hours, hub.package_count);
  const meta = PRIORITY_META[priority];

  const iconMap = {
    AlertTriangle,
    CheckCircle,
    HelpCircle,
  };
  const IconComponent = iconMap[meta.icon as keyof typeof iconMap];

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className={`bg-white rounded-xl flex flex-col shadow-sm border border-[#E5E7EB] overflow-hidden ${
        isMobileModal
          ? 'fixed inset-x-0 bottom-0 z-50 max-h-[85vh] rounded-t-2xl shadow-2xl border-t'
          : 'h-[520px] sm:h-[560px]'
      }`}
      role="dialog"
      aria-modal={isMobileModal}
      aria-label={`Detail Hub ${hub.hub_id}`}
    >
      {/* Detail Header */}
      <div className="p-4 border-b border-[#E5E7EB] bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {!isMobileModal && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -ml-1 text-[#64748B] hover:text-[#0B1C30] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Kembali ke Daftar Hub"
              aria-label="Kembali ke Daftar Hub"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-[#0B1C30] tracking-tight">
                {hub.hub_id}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FDF2F8] text-[#ED0677]">
                Peringkat #{hub.rank}
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">{hub.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${meta.bgClass} ${meta.textClass}`}
          >
            {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
            <span>{meta.label}</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#64748B] hover:text-[#0B1C30] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Tutup Detail"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Detail Body (Scrollable) */}
      <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
        {/* Location Notice */}
        {!hub.lat || !hub.lng ? (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5 text-xs text-slate-700">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Tanpa lokasi</span>
              <span>Hub ini belum memiliki koordinat yang terdaftar.</span>
            </div>
          </div>
        ) : hub.is_placeholder ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-800">
            <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Koordinat sementara</span>
              <span>
                Lokasi ({hub.lat.toFixed(4)}, {hub.lng.toFixed(4)}) menggunakan penempatan perkiraan untuk simulasi operasional.
              </span>
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 text-xs text-[#64748B]">
            <MapPin className="w-4 h-4 text-[#ED0677]" />
            <span>Koordinat: {hub.lat.toFixed(4)}, {hub.lng.toFixed(4)}</span>
          </div>
        )}

        {/* Primary Dwell Stats - 4 cards with Min and Max */}
        <div>
          <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
            Statistik Dwell Time
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                Mean Dwell
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#0B1C30] tabular-nums">
                {formatIndonesianNumber(hub.avg_dwell_hours, 2)}
                <span className="text-xs font-semibold text-[#64748B] ml-1">jam</span>
              </div>
              <p className="text-xs text-[#64748B] tabular-nums mt-0.5">
                {formatIndonesianNumber(hub.avg_dwell_minutes, 0)} menit
              </p>
            </div>

            <div className="p-3.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                Min Dwell
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#0B1C30] tabular-nums">
                {formatIndonesianNumber(hub.min_dwell_hours, 2)}
                <span className="text-xs font-semibold text-[#64748B] ml-1">jam</span>
              </div>
              <p className="text-xs text-[#64748B] tabular-nums mt-0.5">
                {formatIndonesianNumber(hub.min_dwell_minutes, 0)} menit
              </p>
            </div>

            <div className="p-3.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                Max Dwell
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#0B1C30] tabular-nums">
                {formatIndonesianNumber(hub.max_dwell_hours, 2)}
                <span className="text-xs font-semibold text-[#64748B] ml-1">jam</span>
              </div>
              <p className="text-xs text-[#64748B] tabular-nums mt-0.5">
                {formatIndonesianNumber(hub.max_dwell_minutes, 0)} menit
              </p>
            </div>

            <div className="p-3.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                Median Dwell
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#0B1C30] tabular-nums">
                {formatIndonesianNumber(hub.median_dwell_hours, 2)}
                <span className="text-xs font-semibold text-[#64748B] ml-1">jam</span>
              </div>
              <p className="text-xs text-[#64748B] tabular-nums mt-0.5">
                {formatIndonesianNumber(hub.median_dwell_minutes, 0)} menit
              </p>
            </div>
          </div>
        </div>

        {/* Volume & Reliability Breakdown */}
        <div>
          <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
            Volume & Kualitas Data
          </h4>
          <div className="bg-white border border-[#E5E7EB] rounded-xl divide-y divide-slate-100 text-xs sm:text-sm">
            <div className="p-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#64748B]">
                <PackageCheck className="w-4 h-4 text-emerald-600" />
                <span>Paket Selesai</span>
              </span>
              <strong className="text-[#0B1C30] tabular-nums">{formatInteger(hub.package_count)} paket</strong>
            </div>

            <div className="p-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#64748B]">
                <PackageOpen className="w-4 h-4 text-blue-600" />
                <span>Belum Berangkat</span>
              </span>
              <strong className="text-[#0B1C30] tabular-nums">{formatInteger(hub.open_visits)} paket</strong>
            </div>

            <div className="p-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#64748B]">
                <TrendingUp className="w-4 h-4 text-slate-500" />
                <span>Total Pasangan</span>
              </span>
              <strong className="text-[#0B1C30] tabular-nums">{formatInteger(hub.total_pairs)} paket</strong>
            </div>

            <div className="p-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#64748B]">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>Tidak Valid</span>
              </span>
              <span className="tabular-nums">
                <strong className="text-[#B45309]">{formatInteger(hub.invalid_pairs)}</strong> ({formatIndonesianNumber(hub.invalid_pct, 2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Investigation Priority Notice */}
        <div className={`p-3.5 border rounded-xl text-xs ${
          priority === 'priority' 
            ? 'bg-red-50 border-red-200' 
            : priority === 'normal'
            ? 'bg-green-50 border-green-200'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <span className="font-bold text-[#0B1C30] block mb-1">
            Prioritas investigasi (aturan simulasi &gt; 6 jam): 
            <span className={`ml-1 ${priority === 'priority' ? 'text-red-700' : priority === 'normal' ? 'text-green-700' : 'text-slate-700'}`}>
              {priority === 'priority' ? 'Ya' : priority === 'normal' ? 'Tidak' : 'Belum Ada Data'}
            </span>
          </span>
          <p className="text-[#64748B]">
            {priority === 'priority' &&
              'Hub ini memerlukan investigasi karena rata-rata dwell time melebihi 6 jam (aturan simulasi praktis).'}
            {priority === 'normal' &&
              'Hub ini berada dalam rentang normal dengan rata-rata dwell time di bawah atau sama dengan 6 jam.'}
            {priority === 'nodata' &&
              'Hub ini belum memiliki data paket selesai untuk dievaluasi.'}
          </p>
        </div>
      </div>

      {/* Footer action */}
      <div className="p-3 border-t border-[#E5E7EB] bg-slate-50 text-right shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto px-4 py-2 bg-white border border-[#E5E7EB] text-[#0B1C30] text-xs sm:text-sm font-semibold rounded-lg hover:bg-slate-100 transition-colors cursor-pointer min-h-[44px]"
        >
          Tutup Detail
        </button>
      </div>
    </div>
  );
};
