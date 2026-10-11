import React from 'react';
import { ChevronRight, AlertTriangle, CheckCircle, HelpCircle, MapPin } from 'lucide-react';
import { formatIndonesianNumber, formatInteger, type MergedHub } from '../lib/metrics/dwell';
import { getPriority, PRIORITY_META } from '../config/priority';

interface HubListProps {
  hubs: MergedHub[];
  selectedHubId: string | null;
  onSelectHub: (hubId: string) => void;
}

export const HubList: React.FC<HubListProps> = ({
  hubs,
  selectedHubId,
  onSelectHub,
}) => {
  const iconMap = {
    AlertTriangle,
    CheckCircle,
    HelpCircle,
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col h-[520px] sm:h-[560px] shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-3.5 sm:p-4 border-b border-[#E5E7EB] bg-white flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#0B1C30]">Daftar Peringkat Hub</h3>
          <p className="text-xs text-[#64748B]">
            Diurutkan berdasarkan waktu tunggu rata-rata (terlama ke tercepat)
          </p>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#0B1C30] tabular-nums">
          {hubs.length} Hub
        </span>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 focus:outline-none" tabIndex={0} aria-label="Daftar Hub Terurut">
        {hubs.map((hub) => {
          const isSelected = selectedHubId === hub.hub_id;
          const priority = getPriority(hub.avg_dwell_hours, hub.package_count);
          const meta = PRIORITY_META[priority];
          const IconComponent = iconMap[meta.icon as keyof typeof iconMap];

          // Location status
          const hasLocation = hub.lat !== undefined && hub.lng !== undefined;
          const locationText = !hasLocation
            ? 'tanpa lokasi'
            : hub.is_placeholder
            ? 'Koordinat sementara'
            : `${hub.lat?.toFixed(4)}, ${hub.lng?.toFixed(4)}`;

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
              className={`p-3.5 sm:p-4 transition-colors cursor-pointer text-left flex items-center justify-between gap-3 group focus:outline-none ${
                isSelected
                  ? 'bg-[#FDF2F8] border-l-4 border-l-[#ED0677]'
                  : 'hover:bg-slate-50 border-l-4 border-l-transparent'
              }`}
            >
              {/* Left Column: Rank + Info */}
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-extrabold tabular-nums ${
                    isSelected
                      ? 'bg-[#ED0677] text-white shadow-xs'
                      : 'bg-slate-100 text-[#0B1C30]'
                  }`}
                >
                  #{hub.rank}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[#0B1C30] tracking-tight truncate">
                      {hub.hub_id}
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.bgClass} ${meta.textClass}`}
                    >
                      {IconComponent && <IconComponent className="w-2.5 h-2.5" />}
                      {meta.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] truncate mt-0.5" title={hub.name}>
                    {hub.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[11px] text-[#94A3B8] tabular-nums">
                      {formatInteger(hub.package_count)} paket selesai &bull; {hub.open_visits} belum berangkat
                    </p>
                  </div>
                  <p className="text-[10px] text-[#94A3B8] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {locationText}
                  </p>
                </div>
              </div>

              {/* Right Column: Dwell Metric */}
              <div className="text-right shrink-0 flex items-center gap-2">
                <div>
                  <div className="text-base sm:text-lg font-black text-[#0B1C30] tabular-nums">
                    {formatIndonesianNumber(hub.avg_dwell_hours, 2)}
                    <span className="text-xs font-semibold text-[#64748B] ml-1">jam</span>
                  </div>
                  <div className="text-[11px] text-[#64748B] tabular-nums">
                    {formatIndonesianNumber(hub.avg_dwell_minutes, 0)} mnt
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    isSelected ? 'text-[#ED0677] translate-x-1' : 'text-slate-300 group-hover:text-slate-500'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
