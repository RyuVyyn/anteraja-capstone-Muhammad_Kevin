import React from 'react';
import { Search, X } from 'lucide-react';

type FilterPriority = 'all' | 'priority';

interface PriorityFilterProps {
  currentFilter: FilterPriority;
  onFilterChange: (filter: FilterPriority) => void;
  counts: { all: number; priority: number };
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalFiltered: number;
}

export const PriorityFilter: React.FC<PriorityFilterProps> = ({
  currentFilter,
  onFilterChange,
  counts,
  searchQuery,
  onSearchChange,
  totalFiltered,
}) => {
  const filterOptions: Array<{ id: FilterPriority; label: string }> = [
    { id: 'all', label: 'Semua Hub' },
    { id: 'priority', label: 'Hanya Prioritas' },
  ];

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Segmented Control for Priority Filter */}
      <div 
        className="inline-flex items-center gap-0.5 bg-[#F8F9FA] p-1 rounded-lg" 
        role="tablist" 
        aria-label="Filter Prioritas"
      >
        {filterOptions.map((opt) => {
          const isActive = currentFilter === opt.id;
          const count = counts[opt.id] ?? 0;

          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onFilterChange(opt.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-md whitespace-nowrap transition-all min-h-[40px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ED0677] ${
                isActive
                  ? 'bg-[#1E1E24] text-white shadow-sm'
                  : 'bg-transparent text-[#64748B] hover:text-[#0B1C30]'
              }`}
            >
              <span>{opt.label}</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold tabular-nums ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar & Result Count */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 md:w-64">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari Hub ID atau nama..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] placeholder-[#94A3B8] text-[#0B1C30] focus:bg-white focus:outline-none focus:border-[#ED0677] focus:ring-1 focus:ring-[#ED0677] transition-all min-h-[40px]"
            aria-label="Cari Hub"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#64748B] hover:text-[#0B1C30] rounded-full"
              aria-label="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <span className="text-xs font-semibold text-[#64748B] whitespace-nowrap hidden sm:inline-block">
          <strong className="text-[#0B1C30] tabular-nums">{totalFiltered}</strong> hasil
        </span>
      </div>
    </div>
  );
};
