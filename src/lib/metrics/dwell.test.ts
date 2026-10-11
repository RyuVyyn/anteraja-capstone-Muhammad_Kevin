import { describe, it, expect } from 'vitest';
import {
  calculateMedian,
  calculateHubMetrics,
  calculateGlobalKpis,
  rankHubs,
  formatIndonesianNumber,
  formatInteger,
  type RawEvent,
} from './dwell';
import { getPriority } from '../../config/priority';

describe('Dwell Time Metrics Calculation', () => {
  it('calculates median correctly for odd and even length lists', () => {
    expect(calculateMedian([])).toBe(0);
    expect(calculateMedian([10])).toBe(10);
    expect(calculateMedian([10, 20, 30])).toBe(20);
    expect(calculateMedian([10, 20, 30, 40])).toBe(25);
    expect(calculateMedian([40, 10, 30, 20])).toBe(25); // handles unsorted input
  });

  it('separates completed visits, open visits, and invalid pairs', () => {
    const events: RawEvent[] = [
      // Valid completed visit: 2 hours dwell
      { hub_id: 'HUB-001', package_id: 'PKG-1', event_type: 'ARRIVAL', timestamp: '2026-02-18 10:00:00' },
      { hub_id: 'HUB-001', package_id: 'PKG-1', event_type: 'DEPARTURE', timestamp: '2026-02-18 12:00:00' },
      // Valid completed visit: 4 hours dwell
      { hub_id: 'HUB-001', package_id: 'PKG-2', event_type: 'ARRIVAL', timestamp: '2026-02-18 10:00:00' },
      { hub_id: 'HUB-001', package_id: 'PKG-2', event_type: 'DEPARTURE', timestamp: '2026-02-18 14:00:00' },
      // Open visit: ARRIVAL only
      { hub_id: 'HUB-001', package_id: 'PKG-3', event_type: 'ARRIVAL', timestamp: '2026-02-18 15:00:00' },
      // Invalid visit: negative dwell (DEPARTURE before ARRIVAL)
      { hub_id: 'HUB-001', package_id: 'PKG-4', event_type: 'ARRIVAL', timestamp: '2026-02-18 18:00:00' },
      { hub_id: 'HUB-001', package_id: 'PKG-4', event_type: 'DEPARTURE', timestamp: '2026-02-18 17:00:00' },
      // Invalid visit: DEPARTURE only
      { hub_id: 'HUB-001', package_id: 'PKG-5', event_type: 'DEPARTURE', timestamp: '2026-02-18 09:00:00' },
    ];

    const { metric, invalidEvents } = calculateHubMetrics('HUB-001', events);

    expect(metric.package_count).toBe(2);
    expect(metric.avg_dwell_hours).toBe(3); // (2 + 4) / 2
    expect(metric.median_dwell_hours).toBe(3);
    expect(metric.open_visits).toBe(1);
    expect(metric.total_pairs).toBe(5);
    expect(metric.invalid_pairs).toBe(3); // PKG-3 (open), PKG-4 (negative), PKG-5 (dep-only) -> 5 - 2 = 3
    expect(metric.invalid_pct).toBe((3 / 5) * 100);
    expect(invalidEvents.length).toBe(2); // negative dwell + dep only
  });

  it('computes weighted mean dwell from completed visits only, never a simple average of averages', () => {
    const hubs = [
      {
        hub_id: 'HUB-A',
        package_count: 100,
        avg_dwell_hours: 10,
        median_dwell_hours: 10,
        min_dwell_hours: 1,
        max_dwell_hours: 20,
        avg_dwell_minutes: 600,
        median_dwell_minutes: 600,
        min_dwell_minutes: 60,
        max_dwell_minutes: 1200,
        total_pairs: 100,
        invalid_pairs: 0,
        invalid_pct: 0,
        open_visits: 0,
      },
      {
        hub_id: 'HUB-B',
        package_count: 10,
        avg_dwell_hours: 40,
        median_dwell_hours: 40,
        min_dwell_hours: 30,
        max_dwell_hours: 50,
        avg_dwell_minutes: 2400,
        median_dwell_minutes: 2400,
        min_dwell_minutes: 1800,
        max_dwell_minutes: 3000,
        total_pairs: 10,
        invalid_pairs: 0,
        invalid_pct: 0,
        open_visits: 0,
      },
    ];

    const kpis = calculateGlobalKpis(hubs);
    // Simple average would be (10 + 40) / 2 = 25
    // Weighted mean is (100 * 10 + 10 * 40) / 110 = 1400 / 110 = 12.7272...
    expect(kpis.weighted_mean_dwell_hours).toBeCloseTo(12.7272, 3);
    expect(kpis.completed_visits).toBe(110);
    expect(kpis.total_hubs).toBe(2);
  });

  it('ranks hubs by avg_dwell_hours descending and breaks ties by hub_id ascending', () => {
    const hubs = [
      { hub_id: 'HUB-002', avg_dwell_hours: 25.5 } as any,
      { hub_id: 'HUB-001', avg_dwell_hours: 39.4 } as any,
      { hub_id: 'HUB-004', avg_dwell_hours: 25.5 } as any,
      { hub_id: 'HUB-003', avg_dwell_hours: 45.0 } as any,
    ];

    const ranked = rankHubs(hubs);

    expect(ranked[0].hub_id).toBe('HUB-003');
    expect(ranked[0].rank).toBe(1);

    expect(ranked[1].hub_id).toBe('HUB-001');
    expect(ranked[1].rank).toBe(2);

    // Tie between HUB-002 and HUB-004
    expect(ranked[2].hub_id).toBe('HUB-002');
    expect(ranked[2].rank).toBe(3);

    expect(ranked[3].hub_id).toBe('HUB-004');
    expect(ranked[3].rank).toBe(4);
  });

  it('formats Indonesian numbers correctly (comma for decimal, dot for thousands)', () => {
    expect(formatIndonesianNumber(39.41)).toBe('39,41');
    expect(formatIndonesianNumber(2364.5, 1)).toBe('2.364,5');
    expect(formatInteger(28431)).toBe('28.431');
    expect(formatIndonesianNumber(9.02)).toBe('9,02');
  });

  it('calculates min and max dwell hours correctly from completed visits only', () => {
    const events: RawEvent[] = [
      // Completed visit: 2 hours dwell
      { hub_id: 'HUB-001', package_id: 'PKG-1', event_type: 'ARRIVAL', timestamp: '2026-02-18 10:00:00' },
      { hub_id: 'HUB-001', package_id: 'PKG-1', event_type: 'DEPARTURE', timestamp: '2026-02-18 12:00:00' },
      // Completed visit: 10 hours dwell
      { hub_id: 'HUB-001', package_id: 'PKG-2', event_type: 'ARRIVAL', timestamp: '2026-02-18 10:00:00' },
      { hub_id: 'HUB-001', package_id: 'PKG-2', event_type: 'DEPARTURE', timestamp: '2026-02-18 20:00:00' },
      // Completed visit: 5 hours dwell
      { hub_id: 'HUB-001', package_id: 'PKG-3', event_type: 'ARRIVAL', timestamp: '2026-02-18 10:00:00' },
      { hub_id: 'HUB-001', package_id: 'PKG-3', event_type: 'DEPARTURE', timestamp: '2026-02-18 15:00:00' },
      // Open visit: should NOT affect min/max
      { hub_id: 'HUB-001', package_id: 'PKG-4', event_type: 'ARRIVAL', timestamp: '2026-02-18 15:00:00' },
    ];

    const { metric } = calculateHubMetrics('HUB-001', events);

    expect(metric.package_count).toBe(3);
    expect(metric.min_dwell_hours).toBe(2);
    expect(metric.max_dwell_hours).toBe(10);
    expect(metric.avg_dwell_hours).toBeCloseTo(5.6667, 3); // (2 + 10 + 5) / 3
    expect(metric.open_visits).toBe(1);
  });

  it('returns priority when avg_dwell_hours is strictly greater than 6', () => {
    expect(getPriority(6.001, 10)).toBe('priority');
    expect(getPriority(7, 10)).toBe('priority');
    expect(getPriority(39.41, 373)).toBe('priority');
  });

  it('returns normal when avg_dwell_hours is exactly 6 or less', () => {
    expect(getPriority(6, 10)).toBe('normal');
    expect(getPriority(6.0, 10)).toBe('normal');
    expect(getPriority(5.99, 10)).toBe('normal');
    expect(getPriority(0.5, 10)).toBe('normal');
  });

  it('returns nodata when package_count is 0 regardless of avg_dwell_hours', () => {
    expect(getPriority(10, 0)).toBe('nodata');
    expect(getPriority(39.41, 0)).toBe('nodata');
    expect(getPriority(0, 0)).toBe('nodata');
  });

  it('returns nodata when avg_dwell_hours is null, undefined, or NaN', () => {
    expect(getPriority(null as any, 10)).toBe('nodata');
    expect(getPriority(undefined as any, 10)).toBe('nodata');
    expect(getPriority(NaN, 10)).toBe('nodata');
  });
});

