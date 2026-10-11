export interface RawEvent {
  hub_id: string;
  package_id: string;
  event_type: 'ARRIVAL' | 'DEPARTURE' | string;
  timestamp: string;
}

export interface HubMetric {
  hub_id: string;
  name?: string;
  package_count: number;
  avg_dwell_hours: number;
  median_dwell_hours: number;
  min_dwell_hours: number;
  max_dwell_hours: number;
  avg_dwell_minutes: number;
  median_dwell_minutes: number;
  min_dwell_minutes: number;
  max_dwell_minutes: number;
  total_pairs: number;
  invalid_pairs: number;
  invalid_pct: number;
  open_visits: number;
  rank?: number;
  lat?: number;
  lng?: number;
  is_placeholder?: boolean;
}

export interface GlobalKpis {
  total_hubs: number;
  completed_visits: number;
  open_visits: number;
  weighted_mean_dwell_hours: number;
  invalid_pairs_pct: number;
}

export interface MetricsDataset {
  hubs: HubMetric[];
  global: GlobalKpis;
  generated_at: string;
}

// New interfaces for Day 19 data pipeline

export interface HubMetricRaw {
  hub_id: string;
  package_count: number;
  avg_dwell_hours: number;
  median_dwell_hours: number;
  min_dwell_hours: number;
  max_dwell_hours: number;
  avg_dwell_minutes: number;
  median_dwell_minutes: number;
  min_dwell_minutes: number;
  max_dwell_minutes: number;
  total_pairs: number;
  invalid_pairs: number;
  invalid_pct: number;
  open_visits: number;
}

export interface MetricsFile {
  hubs: HubMetricRaw[];
  generated_at?: string;
}

export interface LocationEntry {
  hub_id: string;
  name: string;
  lat: number;
  lng: number;
  is_placeholder: boolean;
}

export interface AiSummary {
  summary: string;
  priority_hubs: string[];
  next_checks: string[];
}

export interface MergedHub extends HubMetricRaw {
  name: string;
  lat?: number;
  lng?: number;
  is_placeholder?: boolean;
  rank: number;
}

export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return sorted[mid];
  }
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

export function calculateHubMetrics(
  hubId: string,
  events: RawEvent[]
): {
  metric: HubMetric;
  invalidEvents: Array<{
    hub_id: string;
    package_id: string;
    event_type: string;
    timestamp: string;
    reason: string;
  }>;
} {
  const pkgMap = new Map<string, RawEvent[]>();
  for (const e of events) {
    if (!pkgMap.has(e.package_id)) {
      pkgMap.set(e.package_id, []);
    }
    pkgMap.get(e.package_id)!.push(e);
  }

  const dwellHoursList: number[] = [];
  const invalidEvents: Array<{
    hub_id: string;
    package_id: string;
    event_type: string;
    timestamp: string;
    reason: string;
  }> = [];

  let completedVisits = 0;
  let openVisits = 0;

  for (const [pkgId, list] of pkgMap.entries()) {
    const arrivals = list
      .filter((e) => e.event_type === 'ARRIVAL')
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const departures = list
      .filter((e) => e.event_type === 'DEPARTURE')
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (arrivals.length > 0 && departures.length > 0) {
      const arr = arrivals[0];
      const dep = departures[0];
      const arrTime = new Date(arr.timestamp).getTime();
      const depTime = new Date(dep.timestamp).getTime();

      if (Number.isNaN(arrTime) || Number.isNaN(depTime)) {
        invalidEvents.push({
          hub_id: hubId,
          package_id: pkgId,
          event_type: 'INVALID_TIMESTAMP',
          timestamp: arr.timestamp || dep.timestamp,
          reason: 'Timestamp tidak dapat di-parse',
        });
      } else {
        const diffHours = (depTime - arrTime) / (1000 * 60 * 60);
        if (diffHours >= 0) {
          completedVisits++;
          dwellHoursList.push(diffHours);
        } else {
          invalidEvents.push({
            hub_id: hubId,
            package_id: pkgId,
            event_type: dep.event_type,
            timestamp: dep.timestamp,
            reason: 'Durasi dwell negatif (DEPARTURE lebih awal dari ARRIVAL)',
          });
        }
      }
    } else if (arrivals.length > 0 && departures.length === 0) {
      openVisits++;
    } else if (arrivals.length === 0 && departures.length > 0) {
      invalidEvents.push({
        hub_id: hubId,
        package_id: pkgId,
        event_type: departures[0].event_type,
        timestamp: departures[0].timestamp,
        reason: 'Hanya ada event DEPARTURE tanpa ARRIVAL',
      });
    }
  }

  const packageCount = completedVisits;
  const totalPairs = pkgMap.size;
  const invalidPairs = totalPairs - packageCount;
  const invalidPct = totalPairs > 0 ? (invalidPairs / totalPairs) * 100 : 0;

  const totalDwellHours = dwellHoursList.reduce((acc, v) => acc + v, 0);
  const avgDwellHours = dwellHoursList.length > 0 ? totalDwellHours / dwellHoursList.length : 0;
  const medianDwellHours = calculateMedian(dwellHoursList);
  const minDwellHours = dwellHoursList.length > 0 ? Math.min(...dwellHoursList) : 0;
  const maxDwellHours = dwellHoursList.length > 0 ? Math.max(...dwellHoursList) : 0;

  const avgDwellMinutes = avgDwellHours * 60;
  const medianDwellMinutes = medianDwellHours * 60;
  const minDwellMinutes = minDwellHours * 60;
  const maxDwellMinutes = maxDwellHours * 60;

  return {
    metric: {
      hub_id: hubId,
      package_count: packageCount,
      avg_dwell_hours: avgDwellHours,
      median_dwell_hours: medianDwellHours,
      min_dwell_hours: minDwellHours,
      max_dwell_hours: maxDwellHours,
      avg_dwell_minutes: avgDwellMinutes,
      median_dwell_minutes: medianDwellMinutes,
      min_dwell_minutes: minDwellMinutes,
      max_dwell_minutes: maxDwellMinutes,
      total_pairs: totalPairs,
      invalid_pairs: invalidPairs,
      invalid_pct: invalidPct,
      open_visits: openVisits,
    },
    invalidEvents,
  };
}

export function calculateGlobalKpis(hubs: HubMetric[]): GlobalKpis {
  const totalHubs = hubs.length;
  const completedVisits = hubs.reduce((acc, h) => acc + h.package_count, 0);
  const openVisits = hubs.reduce((acc, h) => acc + h.open_visits, 0);
  const totalPairs = hubs.reduce((acc, h) => acc + h.total_pairs, 0);
  const invalidPairs = hubs.reduce((acc, h) => acc + h.invalid_pairs, 0);

  const weightedSum = hubs.reduce((acc, h) => acc + h.avg_dwell_hours * h.package_count, 0);
  const weightedMeanDwellHours = completedVisits > 0 ? weightedSum / completedVisits : 0;
  const invalidPairsPct = totalPairs > 0 ? (invalidPairs / totalPairs) * 100 : 0;

  return {
    total_hubs: totalHubs,
    completed_visits: completedVisits,
    open_visits: openVisits,
    weighted_mean_dwell_hours: weightedMeanDwellHours,
    invalid_pairs_pct: invalidPairsPct,
  };
}

export function rankHubs(hubs: HubMetric[]): HubMetric[] {
  const sorted = [...hubs].sort((a, b) => {
    if (b.avg_dwell_hours !== a.avg_dwell_hours) {
      return b.avg_dwell_hours - a.avg_dwell_hours;
    }
    return a.hub_id.localeCompare(b.hub_id);
  });

  return sorted.map((hub, idx) => ({
    ...hub,
    rank: idx + 1,
  }));
}

/**
 * Format numbers according to Indonesian conventions (dot for thousands, comma for decimals)
 */
export function formatIndonesianNumber(value: number, decimals = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '0';
  const parts = value.toFixed(decimals).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (decimals === 0 || !parts[1]) {
    return intPart;
  }
  return `${intPart},${parts[1]}`;
}

export function formatInteger(value: number): string {
  return formatIndonesianNumber(value, 0);
}
