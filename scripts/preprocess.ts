import fs from 'node:fs';
import path from 'node:path';
import Papa from 'papaparse';
import {
  calculateHubMetrics,
  type RawEvent,
  type HubMetricRaw,
} from '../src/lib/metrics/dwell';

interface InvalidRecordOutput {
  id: string;
  hub_id: string;
  package_id: string;
  event_type: string;
  timestamp: string;
  reason: string;
}

function run() {
  const csvPath = path.resolve(process.cwd(), 'data/raw/events.csv');
  const publicDataDir = path.resolve(process.cwd(), 'public/data');

  if (!fs.existsSync(csvPath)) {
    console.error(`[ERROR] CSV file not found at: ${csvPath}`);
    process.exit(1);
  }

  console.log(`[PREPROCESS] Reading CSV from ${csvPath}...`);
  const csvContent = fs.readFileSync(csvPath, 'utf-8');

  const parsed = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  console.log(`[PREPROCESS] Parsed ${parsed.data.length} rows.`);

  const eventsByHub = new Map<string, RawEvent[]>();
  const invalidRecords: InvalidRecordOutput[] = [];
  let recordCounter = 1;

  for (const row of parsed.data) {
    const rawHub = row.hub_id ? row.hub_id.trim().toUpperCase() : '';
    const rawPkg = row.package_id ? row.package_id.trim() : '';
    const rawEvent = row.event_type ? row.event_type.trim().toUpperCase() : '';
    const rawTimestamp = row.timestamp ? row.timestamp.trim() : '';

    if (!rawHub || !rawPkg || !rawEvent || !rawTimestamp) {
      invalidRecords.push({
        id: `INV-${String(recordCounter++).padStart(5, '0')}`,
        hub_id: rawHub || 'UNKNOWN',
        package_id: rawPkg || 'UNKNOWN',
        event_type: rawEvent || 'UNKNOWN',
        timestamp: rawTimestamp || 'N/A',
        reason: 'Field wajib kosong (missing field)',
      });
      continue;
    }

    if (rawEvent !== 'ARRIVAL' && rawEvent !== 'DEPARTURE') {
      invalidRecords.push({
        id: `INV-${String(recordCounter++).padStart(5, '0')}`,
        hub_id: rawHub,
        package_id: rawPkg,
        event_type: rawEvent,
        timestamp: rawTimestamp,
        reason: `Tipe event tidak valid: ${rawEvent}`,
      });
      continue;
    }

    if (!eventsByHub.has(rawHub)) {
      eventsByHub.set(rawHub, []);
    }

    eventsByHub.get(rawHub)!.push({
      hub_id: rawHub,
      package_id: rawPkg,
      event_type: rawEvent,
      timestamp: rawTimestamp,
    });
  }

  const unrankedHubs: HubMetricRaw[] = [];

  for (const [hubId, evts] of eventsByHub.entries()) {
    const { metric, invalidEvents } = calculateHubMetrics(hubId, evts);

    for (const inv of invalidEvents) {
      invalidRecords.push({
        id: `INV-${String(recordCounter++).padStart(5, '0')}`,
        hub_id: inv.hub_id,
        package_id: inv.package_id,
        event_type: inv.event_type,
        timestamp: inv.timestamp,
        reason: inv.reason,
      });
    }

    unrankedHubs.push(metric);
  }

  // Sort hubs by hub_id for consistent output
  const sortedHubs = unrankedHubs.sort((a, b) => a.hub_id.localeCompare(b.hub_id));

  // Compute global totals for logging
  const totalCompletedVisits = sortedHubs.reduce((acc, h) => acc + h.package_count, 0);
  const totalOpenVisits = sortedHubs.reduce((acc, h) => acc + h.open_visits, 0);
  const totalPairs = sortedHubs.reduce((acc, h) => acc + h.total_pairs, 0);
  const totalInvalidPairs = sortedHubs.reduce((acc, h) => acc + h.invalid_pairs, 0);
  const weightedSum = sortedHubs.reduce((acc, h) => acc + h.avg_dwell_hours * h.package_count, 0);
  const weightedMeanDwell = totalCompletedVisits > 0 ? weightedSum / totalCompletedVisits : 0;
  const globalInvalidPct = totalPairs > 0 ? (totalInvalidPairs / totalPairs) * 100 : 0;

  const metricsOutput = {
    hubs: sortedHubs,
  };

  fs.mkdirSync(publicDataDir, { recursive: true });

  const metricsOutputPath = path.join(publicDataDir, 'metrics.json');
  const invalidOutputPath = path.join(publicDataDir, 'invalid_records.json');

  fs.writeFileSync(metricsOutputPath, JSON.stringify(metricsOutput, null, 2), 'utf-8');
  fs.writeFileSync(invalidOutputPath, JSON.stringify(invalidRecords, null, 2), 'utf-8');

  console.log(`\n======================================================`);
  console.log(`             PREPROCESSING SUMMARY                    `);
  console.log(`======================================================`);
  console.log(`Total data rows:           ${parsed.data.length}`);
  console.log(`Total distinct hubs:       ${sortedHubs.length}`);
  console.log(`Completed visits (sum):    ${totalCompletedVisits}`);
  console.log(`Open visits (sum):         ${totalOpenVisits}`);
  console.log(`Weighted mean dwell:       ${weightedMeanDwell.toFixed(2)} jam`);
  console.log(`Global invalid pairs:      ${globalInvalidPct.toFixed(2)}%`);
  console.log(`Total invalid log records: ${invalidRecords.length}`);
  console.log(`Files generated:`);
  console.log(`  - ${metricsOutputPath}`);
  console.log(`  - ${invalidOutputPath}`);
  console.log(`======================================================\n`);

  console.log(`Validation Check against Section 6.1:`);
  const checkHubs = ['HUB-007', 'HUB-025', 'HUB-012', 'HUB-018', 'HUB-020'];
  for (const ch of checkHubs) {
    const h = sortedHubs.find((item) => item.hub_id === ch);
    if (h) {
      console.log(
        `  ${h.hub_id}: count=${h.package_count}, avg=${h.avg_dwell_hours.toFixed(2)}, median=${h.median_dwell_hours.toFixed(2)}, total_pairs=${h.total_pairs}, invalid_pairs=${h.invalid_pairs}, invalid_pct=${h.invalid_pct.toFixed(2)}%, open_visits=${h.open_visits}`
      );
    }
  }
}

run();
