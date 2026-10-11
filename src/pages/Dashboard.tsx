import React, { useState, useEffect, useMemo } from 'react';
import { KpiCards } from '../components/KpiCards';
import { TopHubs } from '../components/TopHubs';
import { AiSummary } from '../components/AiSummary';
import { PriorityFilter } from '../components/PriorityFilter';
import { HubMap } from '../components/HubMap';
import { HubList } from '../components/HubList';
import { HubDetail } from '../components/HubDetail';
import { LoadingSkeleton, EmptyState, ErrorState } from '../components/States';
import type { MetricsFile, LocationEntry, AiSummary as AiSummaryType, MergedHub } from '../lib/metrics/dwell';
import { calculateGlobalKpis, rankHubs } from '../lib/metrics/dwell';
import { getPriority } from '../config/priority';

type FilterPriority = 'all' | 'priority';

export const Dashboard: React.FC = () => {
  const [hubs, setHubs] = useState<MergedHub[]>([]);
  const [aiSummary, setAiSummary] = useState<AiSummaryType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Single shared filter state
  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedHubId, setSelectedHubId] = useState<string | null>(null);

  // Mobile detection for bottom-sheet vs side panel
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Load all three files in parallel
      const [metricsRes, locationsRes, aiSummaryRes] = await Promise.all([
        fetch('/data/metrics.json'),
        fetch('/data/locations.json'),
        fetch('/data/ai-summary.json').catch(() => null), // AI summary is optional
      ]);

      if (!metricsRes.ok) {
        throw new Error(`Gagal memuat file metrik (Status ${metricsRes.status})`);
      }
      if (!locationsRes.ok) {
        throw new Error(`Gagal memuat file lokasi (Status ${locationsRes.status})`);
      }

      const metricsData: MetricsFile = await metricsRes.json();
      const locationsData: LocationEntry[] = await locationsRes.json();
      
      // AI summary is optional
      let aiData: AiSummaryType | null = null;
      if (aiSummaryRes && aiSummaryRes.ok) {
        try {
          aiData = await aiSummaryRes.json();
        } catch (e) {
          console.warn('[WARN] Could not parse ai-summary.json:', e);
        }
      }

      // Merge metrics and locations by hub_id
      const locationsMap = new Map<string, LocationEntry>();
      for (const loc of locationsData) {
        locationsMap.set(loc.hub_id, loc);
      }

      const mergedHubs: MergedHub[] = metricsData.hubs.map((metric) => {
        const loc = locationsMap.get(metric.hub_id);
        return {
          ...metric,
          name: loc ? loc.name : metric.hub_id,
          lat: loc?.lat,
          lng: loc?.lng,
          is_placeholder: loc?.is_placeholder,
          rank: 0, // Will be set by rankHubs
        };
      });

      // Compute rank at runtime - rankHubs returns array with rank property set
      const rankedHubs = rankHubs(mergedHubs) as MergedHub[];

      setHubs(rankedHubs);
      setAiSummary(aiData);
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan saat memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute global KPIs at runtime
  const globalKpis = useMemo(() => {
    return calculateGlobalKpis(hubs);
  }, [hubs]);

  // Compute priority hub count
  const priorityHubCount = useMemo(() => {
    return hubs.filter(
      (hub) => getPriority(hub.avg_dwell_hours, hub.package_count) === 'priority'
    ).length;
  }, [hubs]);

  // Compute filter counts over all hubs
  const filterCounts = useMemo(() => {
    const counts = {
      all: hubs.length,
      priority: priorityHubCount,
    };
    return counts;
  }, [hubs, priorityHubCount]);

  // Filtered hubs (Single Source of Truth for Map and List)
  const filteredHubs = useMemo(() => {
    return hubs.filter((hub) => {
      // 1. Priority filter
      if (priorityFilter === 'priority') {
        const p = getPriority(hub.avg_dwell_hours, hub.package_count);
        if (p !== 'priority') return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = hub.hub_id.toLowerCase().includes(q);
        const matchesName = (hub.name || '').toLowerCase().includes(q);
        if (!matchesId && !matchesName) return false;
      }

      return true;
    });
  }, [hubs, priorityFilter, searchQuery]);

  const selectedHub = useMemo(() => {
    if (!selectedHubId || !hubs.length) return null;
    return hubs.find((h) => h.hub_id === selectedHubId) || null;
  }, [selectedHubId, hubs]);

  const handleResetFilters = () => {
    setPriorityFilter('all');
    setSearchQuery('');
  };

  if (isLoading) {
    return (
      <main className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <LoadingSkeleton />
      </main>
    );
  }

  if (error || !hubs.length) {
    return (
      <main className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorState onRetry={loadData} error={error || undefined} />
      </main>
    );
  }

  return (
    <main className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 1. Global KPI Cards */}
      <div className="mb-6">
        <KpiCards kpis={globalKpis} priorityHubCount={priorityHubCount} />
      </div>

      {/* 2. Top 3 Hub + AI Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-5 lg:items-start">
        {/* Top 3 Hub (8 cols desktop) */}
        <div className="lg:col-span-8">
          <TopHubs
            topHubs={hubs}
            selectedHubId={selectedHubId}
            onSelectHub={(id) => setSelectedHubId(id)}
          />
        </div>

        {/* AI Summary (4 cols desktop) */}
        <div className="lg:col-span-4">
          <AiSummary 
            aiSummary={aiSummary} 
            allHubIds={hubs.map(h => h.hub_id)} 
          />
        </div>
      </div>

      {/* 3. Priority & Search Toolbar */}
      <div className="mb-6">
        <PriorityFilter
          currentFilter={priorityFilter}
          onFilterChange={setPriorityFilter}
          counts={filterCounts}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalFiltered={filteredHubs.length}
        />
      </div>

      {/* 4. Map & List Working Area */}
      {filteredHubs.length === 0 ? (
        <EmptyState onReset={handleResetFilters} />
      ) : (
        <section
          aria-label="Area Peta dan Daftar Hub"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
        >
          {/* Map Section (7 cols desktop) */}
          <div className="lg:col-span-7">
            <HubMap
              hubs={filteredHubs}
              selectedHubId={selectedHubId}
              onSelectHub={(id) => setSelectedHubId(id)}
            />
          </div>

          {/* List or Detail Section (5 cols desktop) */}
          <div className="lg:col-span-5">
            {selectedHub && !isMobile ? (
              <HubDetail
                hub={selectedHub}
                onClose={() => setSelectedHubId(null)}
              />
            ) : (
              <HubList
                hubs={filteredHubs}
                selectedHubId={selectedHubId}
                onSelectHub={(id) => setSelectedHubId(id)}
              />
            )}
          </div>
        </section>
      )}

      {/* Mobile Bottom Sheet Modal for Detail */}
      {isMobile && selectedHub && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity"
            onClick={() => setSelectedHubId(null)}
            aria-hidden="true"
          />
          <HubDetail
            hub={selectedHub}
            onClose={() => setSelectedHubId(null)}
            isMobileModal={true}
          />
        </>
      )}
    </main>
  );
};
