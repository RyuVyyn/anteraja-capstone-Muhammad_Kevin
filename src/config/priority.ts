export type PriorityLevel = 'priority' | 'normal' | 'nodata';

// Practice simulation rule, not an official SLA
export const PRIORITY_THRESHOLD_HOURS = 6;

export function getPriority(
  avgDwellHours: number | null | undefined,
  packageCount: number = 0
): PriorityLevel {
  // No data: hub has no completed visits
  if (packageCount === 0 || avgDwellHours === null || avgDwellHours === undefined || Number.isNaN(avgDwellHours)) {
    return 'nodata';
  }
  // Priority: avg dwell > 6 hours (strictly greater)
  if (avgDwellHours > PRIORITY_THRESHOLD_HOURS) {
    return 'priority';
  }
  // Normal: avg dwell <= 6 hours
  return 'normal';
}

export const PRIORITY_META: Record<
  PriorityLevel,
  { label: string; bgClass: string; textClass: string; markerColor: string; borderColor: string; icon: string }
> = {
  priority: {
    label: 'Prioritas',
    bgClass: 'bg-[#FEF2F2]',
    textClass: 'text-[#B91C1C]',
    markerColor: '#DC2626',
    borderColor: 'border-[#FCA5A5]',
    icon: 'AlertTriangle',
  },
  normal: {
    label: 'Normal',
    bgClass: 'bg-[#ECFDF5]',
    textClass: 'text-[#047857]',
    markerColor: '#10B981',
    borderColor: 'border-[#6EE7B7]',
    icon: 'CheckCircle',
  },
  nodata: {
    label: 'Belum Ada Data',
    bgClass: 'bg-[#F1F5F9]',
    textClass: 'text-[#64748B]',
    markerColor: '#94A3B8',
    borderColor: 'border-[#CBD5E1]',
    icon: 'HelpCircle',
  },
};

// Alias for AGENTS.md compliance
export type PriorityState = PriorityLevel;
export { getPriority as getPriorityState };
