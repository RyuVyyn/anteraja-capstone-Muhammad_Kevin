import React from 'react';
import { Building2, PackageCheck, Clock, AlertTriangle } from 'lucide-react';
import { formatIndonesianNumber, formatInteger, type GlobalKpis } from '../lib/metrics/dwell';

interface KpiCardsProps {
  kpis: GlobalKpis;
  priorityHubCount: number;
}

interface CaptionChip {
  bg: string;
  textColor: string;
  text: string;
}

interface CardData {
  label: string;
  value: string;
  unit: string;
  icon: typeof Building2;
  accentColor?: string;
  badgeBg: string;
  isHero?: boolean;
  subtext?: string;
  captionChip?: CaptionChip;
  supportingText?: string;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ kpis, priorityHubCount }) => {
  const cards: CardData[] = [
    {
      label: 'Total Hub',
      value: formatInteger(kpis.total_hubs),
      unit: 'hub',
      icon: Building2,
      accentColor: 'text-[#1E1E24]',
      badgeBg: 'bg-slate-100 text-slate-700',
      isHero: false,
      subtext: undefined,
      captionChip: undefined,
      supportingText: undefined,
    },
    {
      label: 'Paket Selesai',
      value: formatInteger(kpis.completed_visits),
      unit: 'paket',
      icon: PackageCheck,
      accentColor: 'text-[#047857]',
      badgeBg: 'bg-[#ECFDF5] text-[#047857]',
      isHero: false,
      subtext: undefined,
      captionChip: undefined,
      supportingText: undefined,
    },
    {
      label: 'Rata-rata Dwell Global',
      value: formatIndonesianNumber(kpis.weighted_mean_dwell_hours, 2),
      unit: 'jam',
      icon: Clock,
      badgeBg: 'bg-slate-100 text-slate-700',
      accentColor: undefined,
      isHero: undefined,
      subtext: undefined,
      captionChip: undefined,
      supportingText: undefined,
    },
    {
      label: 'Hub Prioritas',
      value: formatInteger(priorityHubCount),
      unit: 'hub',
      icon: AlertTriangle,
      accentColor: 'text-[#B91C1C]',
      badgeBg: 'bg-[#FEF2F2] text-[#B91C1C]',
      isHero: false,
      subtext: undefined,
      captionChip: undefined,
      supportingText: undefined,
    },
  ];

  return (
    <section aria-label="Ringkasan KPI Global">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className={`bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between transition-shadow hover:shadow-sm ${
                c.isHero ? 'border-t-[3px] border-t-[#C026D3]' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  {c.label}
                </span>
                <div className={`p-1.5 rounded-lg ${c.badgeBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline gap-1.5 my-1">
                <span className={`text-2xl sm:text-[28px] font-extrabold tracking-tight tabular-nums ${c.accentColor}`}>
                  {c.value}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#64748B]">
                  {c.unit}
                </span>
              </div>

              <div className="mt-1 space-y-1">
                <p className="text-[11px] text-[#64748B] line-clamp-1">
                  {c.subtext}
                </p>
                {c.captionChip && (
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${c.captionChip.bg} ${c.captionChip.textColor}`}>
                    {c.captionChip.text}
                  </span>
                )}
                {c.supportingText && (
                  <p className="text-[10px] text-[#92400E]">
                    {c.supportingText}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
