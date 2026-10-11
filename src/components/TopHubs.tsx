import React from 'react';
import { AlertTriangle, CheckCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { formatIndonesianNumber, type MergedHub } from '../lib/metrics/dwell';
import { getPriority, PRIORITY_META } from '../config/priority';

interface TopHubsProps {
  topHubs: MergedHub[];
  selectedHubId: string | null;
  onSelectHub: (hubId: string) => void;
}

export const TopHubs: React.FC<TopHubsProps> = ({
  topHubs,
  selectedHubId,
  onSelectHub,
}) => {
  const iconMap = {
    AlertTriangle,
    CheckCircle,
    HelpCircle,
  };

  return (
    <section aria-label="3 Hub dengan Waktu Tunggu Tertinggi">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#0B1C30] flex items-center gap-2">
            <span>Top 3 Hub Dwell Tertinggi</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              Berdasarkan durasi dwell selesai
            </span>
          </h2>
          <p className="text-xs text-[#64748B]">
            Hub dengan rata-rata dwell time tertinggi memerlukan perhatian operasional
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {topHubs.slice(0, 3).map((hub, idx) => {
          const isSelected = selectedHubId === hub.hub_id;
          const priority = getPriority(hub.avg_dwell_hours, hub.package_count);
          const meta = PRIORITY_META[priority];
          const IconComponent = iconMap[meta.icon as keyof typeof iconMap];

          return (
            <div
              key={hub.hub_id}
              onClick={() => onSelectHub(hub.hub_id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectHub(hub.hub_id);
                }
              }}
              tabIndex={0}
              role="button"
              aria-pressed={isSelected}
              className={`bg-white rounded-xl p-4 sm:p-5 border transition-all text-left cursor-pointer relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-[#ED0677] ${
                isSelected
                  ? 'border-[#ED0677] ring-2 ring-[#ED0677]/20 shadow-md'
                  : 'border-[#E5E7EB] hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {/* Rank indicator */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                      isSelected
                        ? 'bg-[#ED0677] text-white'
                        : 'bg-[#1E1E24] text-white'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <span className="font-extrabold text-sm sm:text-base text-[#0B1C30] tracking-tight">
                    {hub.hub_id}
                  </span>
                </div>

                <div
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${meta.bgClass} ${meta.textClass}`}
                >
                  {IconComponent && <IconComponent className="w-3 h-3" />}
                  <span>{meta.label}</span>
                </div>
              </div>

              {/* Hub Name */}
              <p className="text-xs font-medium text-[#64748B] mb-3 truncate" title={hub.name}>
                {hub.name}
              </p>

              {/* Metrics */}
              <div className="bg-[#F8F9FA] rounded-lg p-3 border border-slate-100 mb-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] font-semibold text-[#64748B]">Rata-rata Dwell Time</span>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-black text-[#0B1C30] tabular-nums">
                      {formatIndonesianNumber(hub.avg_dwell_hours, 2)}
                    </span>
                    <span className="text-xs font-bold text-[#64748B] ml-1">jam</span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-[#64748B] font-medium tabular-nums mt-0.5">
                  setara {formatIndonesianNumber(hub.avg_dwell_minutes, 0)} menit
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span className="text-[#64748B]">
                  <strong className="text-[#0B1C30] tabular-nums">{formatIndonesianNumber(hub.package_count, 0)}</strong> paket selesai
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#ED0677] group-hover:translate-x-0.5 transition-transform">
                  {isSelected ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Terpilih</span>
                    </>
                  ) : (
                    <>
                      <span>Pilih Hub</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
