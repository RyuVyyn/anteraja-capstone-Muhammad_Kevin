import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import { formatInteger } from '../lib/metrics/dwell';
import { LoadingSkeleton, EmptyState, ErrorState } from '../components/States';

export interface InvalidRecord {
  id: string;
  hub_id: string;
  package_id: string;
  event_type: string;
  timestamp: string;
  reason: string;
}

interface InvalidRecordsProps {
  onBackToDashboard: () => void;
}

export const InvalidRecords: React.FC<InvalidRecordsProps> = ({ onBackToDashboard }) => {
  const [records, setRecords] = useState<InvalidRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReason, setSelectedReason] = useState<string>('all');
  const [selectedHub, setSelectedHub] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 25;

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/data/invalid_records.json');
      if (!res.ok) {
        throw new Error(`Gagal memuat catatan tidak valid (Status ${res.status})`);
      }
      const data: InvalidRecord[] = await res.json();
      setRecords(data);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat catatan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Distinct reasons & hubs for filter dropdowns
  const reasonsList = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => set.add(r.reason));
    return Array.from(set).sort();
  }, [records]);

  const hubsList = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => set.add(r.hub_id));
    return Array.from(set).sort();
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedReason !== 'all' && r.reason !== selectedReason) return false;
      if (selectedHub !== 'all' && r.hub_id !== selectedHub) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesHub = r.hub_id.toLowerCase().includes(q);
        const matchesPkg = r.package_id.toLowerCase().includes(q);
        const matchesReason = r.reason.toLowerCase().includes(q);
        if (!matchesHub && !matchesPkg && !matchesReason) return false;
      }
      return true;
    });
  }, [records, selectedReason, selectedHub, searchQuery]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedReason, selectedHub, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  const handleExportCsv = () => {
    if (filteredRecords.length === 0) return;
    const headers = ['ID', 'Hub ID', 'Package ID', 'Event Type', 'Timestamp', 'Alasan (Reason)'];
    const rows = filteredRecords.map((r) => [
      r.id,
      r.hub_id,
      r.package_id,
      r.event_type,
      r.timestamp,
      `"${r.reason.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `anteraja_data_tidak_valid_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <main className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <LoadingSkeleton />
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorState onRetry={loadData} error={error} />
      </main>
    );
  }

  return (
    <main className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#ED0677] hover:underline mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard Utama</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-[#0B1C30]">
              Audit Data Tidak Valid
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 tabular-nums">
              {formatInteger(records.length)} Catatan Terdeteksi
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Daftar event atau pasangan log yang dikecualikan dari perhitungan metrik dwell time karena anomali timestamp atau urutan event.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1E1E24] text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-black transition-colors cursor-pointer min-h-[44px]"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor CSV ({formatInteger(filteredRecords.length)})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Hub ID, Package ID..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] focus:bg-white focus:outline-none focus:border-[#ED0677] min-h-[44px]"
          />
        </div>

        {/* Reason Filter */}
        <div>
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] focus:bg-white focus:outline-none focus:border-[#ED0677] min-h-[44px]"
            aria-label="Filter berdasarkan alasan"
          >
            <option value="all">Semua Alasan Anomali</option>
            {reasonsList.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Hub Filter */}
        <div>
          <select
            value={selectedHub}
            onChange={(e) => setSelectedHub(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] focus:bg-white focus:outline-none focus:border-[#ED0677] min-h-[44px]"
            aria-label="Filter berdasarkan hub"
          >
            <option value="all">Semua Hub ID ({hubsList.length} Hub)</option>
            {hubsList.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Records Table */}
      {filteredRecords.length === 0 ? (
        <EmptyState
          message="Tidak ada catatan data tidak valid yang sesuai dengan filter atau kata kunci."
          onReset={() => {
            setSearchQuery('');
            setSelectedReason('all');
            setSelectedHub('all');
          }}
        />
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB] text-[#64748B] font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Hub ID</th>
                  <th className="py-3 px-4">Package ID</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Penyebab / Alasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-[#64748B] tabular-nums">
                      {r.id}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-[#0B1C30]">
                      {r.hub_id}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-[#0B1C30]">
                      {r.package_id}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          r.event_type === 'ARRIVAL'
                            ? 'bg-blue-100 text-blue-700'
                            : r.event_type === 'DEPARTURE'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {r.event_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#64748B] tabular-nums font-mono text-xs">
                      {r.timestamp}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                        <span>{r.reason}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-[#E5E7EB] bg-[#F8F9FA] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
            <div>
              Menampilkan{' '}
              <strong className="text-[#0B1C30] tabular-nums">
                {(currentPage - 1) * pageSize + 1}
              </strong>{' '}
              -{' '}
              <strong className="text-[#0B1C30] tabular-nums">
                {Math.min(currentPage * pageSize, filteredRecords.length)}
              </strong>{' '}
              dari <strong className="text-[#0B1C30] tabular-nums">{formatInteger(filteredRecords.length)}</strong> catatan
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-[#E5E7EB] bg-white text-[#0B1C30] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-semibold px-2 tabular-nums">
                Halaman {currentPage} dari {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-[#E5E7EB] bg-white text-[#0B1C30] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Halaman Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
