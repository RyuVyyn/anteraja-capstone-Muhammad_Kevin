import fs from 'node:fs';
import path from 'node:path';
import type { MetricsFile, LocationEntry } from '../src/lib/metrics/dwell';

/**
 * Simple seeded pseudo-random number generator (Mulberry32)
 * Returns a function that generates numbers in [0, 1)
 */
function seededRandom(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a deterministic seed from a hub_id string
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function run() {
  const metricsPath = path.resolve(process.cwd(), 'public/data/metrics.json');
  const locationsPath = path.resolve(process.cwd(), 'public/data/locations.json');

  if (!fs.existsSync(metricsPath)) {
    console.error(`[ERROR] metrics.json not found at: ${metricsPath}`);
    console.error(`[ERROR] Please run preprocess.ts first.`);
    process.exit(1);
  }

  console.log(`[GENERATE-LOCATIONS] Reading metrics from ${metricsPath}...`);
  const metricsData: MetricsFile = JSON.parse(fs.readFileSync(metricsPath, 'utf-8'));
  const hubIds = metricsData.hubs.map((h) => h.hub_id).sort();

  console.log(`[GENERATE-LOCATIONS] Found ${hubIds.length} hubs in metrics.json`);

  // Load existing locations if present
  const existingLocations = new Map<string, LocationEntry>();
  if (fs.existsSync(locationsPath)) {
    try {
      const existingData: LocationEntry[] = JSON.parse(fs.readFileSync(locationsPath, 'utf-8'));
      for (const loc of existingData) {
        // Only preserve entries that are explicitly NOT placeholders
        if (loc.is_placeholder === false) {
          existingLocations.set(loc.hub_id, loc);
        }
      }
      console.log(`[GENERATE-LOCATIONS] Preserved ${existingLocations.size} real (non-placeholder) locations`);
    } catch (e) {
      console.warn(`[WARN] Could not parse existing locations.json:`, e);
    }
  }

  // Jabodetabek bounds (Jakarta metropolitan area, land only)
  // Adjusted to avoid Jakarta Bay and focus on populated land areas
  const LAT_MIN = -6.38;
  const LAT_MAX = -6.12;
  const LNG_MIN = 106.68;
  const LNG_MAX = 106.98;

  const locations: LocationEntry[] = [];
  let generatedCount = 0;
  let preservedCount = 0;

  for (let i = 0; i < hubIds.length; i++) {
    const hubId = hubIds[i];

    // Check if we have a real location for this hub
    if (existingLocations.has(hubId)) {
      locations.push(existingLocations.get(hubId)!);
      preservedCount++;
      continue;
    }

    // Generate deterministic placeholder coordinates
    const seed = hashString(hubId) + i; // Include index to spread hubs more evenly
    const rng = seededRandom(seed);

    const lat = LAT_MIN + rng() * (LAT_MAX - LAT_MIN);
    const lng = LNG_MIN + rng() * (LNG_MAX - LNG_MIN);

    locations.push({
      hub_id: hubId,
      name: hubId, // name equals hub_id per AGENTS.md
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      is_placeholder: true,
    });

    generatedCount++;
  }

  // Write to locations.json
  const publicDataDir = path.resolve(process.cwd(), 'public/data');
  fs.mkdirSync(publicDataDir, { recursive: true });
  fs.writeFileSync(locationsPath, JSON.stringify(locations, null, 2), 'utf-8');

  console.log(`\n======================================================`);
  console.log(`         LOCATION GENERATION SUMMARY                  `);
  console.log(`======================================================`);
  console.log(`Total hubs:               ${hubIds.length}`);
  console.log(`Generated placeholders:   ${generatedCount}`);
  console.log(`Preserved real locations: ${preservedCount}`);
  console.log(`Output file:              ${locationsPath}`);
  console.log(`======================================================\n`);
}

run();
