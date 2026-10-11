import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import type { AiSummary as AiSummaryType } from '../lib/metrics/dwell';

interface AiSummaryProps {
  aiSummary: AiSummaryType | null;
  allHubIds: string[];
}

export const AiSummary: React.FC<AiSummaryProps> = ({ aiSummary, allHubIds }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!aiSummary) {
    return (
      <section
        aria-labelledby="ai-summary-heading"
        className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 id="ai-summary-heading" className="text-base font-semibold text-[#1E1E24] mb-1">
              Ringkasan AI
            </h2>
            <p className="text-xs text-[#6B7280]">Dibuat otomatis, bukan sumber angka</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#6B7280]">Ringkasan AI tidak tersedia</p>
        </div>
      </section>
    );
  }

  const hubIdSet = new Set(allHubIds);

  return (
    <section
      aria-labelledby="ai-summary-heading"
      className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 id="ai-summary-heading" className="text-base font-semibold text-[#1E1E24] mb-1">
            Ringkasan AI
          </h2>
          <p className="text-xs text-[#6B7280]">Dibuat otomatis, bukan sumber angka</p>
        </div>
      </div>

      {/* Content - scrollable with max height */}
      <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2">
        {/* Summary */}
        <div>
          <h3 className="text-sm font-medium text-[#1E1E24] mb-2">Ringkasan</h3>
          <p
            className={`text-sm text-[#6B7280] leading-relaxed break-words ${
              !isExpanded ? 'line-clamp-3 lg:line-clamp-none' : ''
            }`}
          >
            {aiSummary.summary}
          </p>
        </div>

        {/* Mobile expand button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="lg:hidden text-sm text-[#7C3AED] font-medium flex items-center gap-1"
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <>
              Tutup <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Selengkapnya <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Priority Hubs - show only on desktop or when expanded on mobile */}
        {(isExpanded || window.innerWidth >= 1024) && aiSummary.priority_hubs.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-[#1E1E24] mb-2">Hub Prioritas</h3>
            <div className="flex flex-wrap gap-2">
              {aiSummary.priority_hubs.map((hubId, idx) => {
                const isValid = hubIdSet.has(hubId);
                return (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      isValid
                        ? 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FCA5A5]'
                        : 'bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]'
                    }`}
                  >
                    {isValid ? (
                      hubId
                    ) : (
                      <>
                        <AlertTriangle className="w-3 h-3" />
                        {hubId} (tidak ditemukan di data)
                      </>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Next Checks - show only on desktop or when expanded on mobile */}
        {(isExpanded || window.innerWidth >= 1024) && aiSummary.next_checks.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-[#1E1E24] mb-2">Pemeriksaan Lanjutan</h3>
            <ul className="space-y-2">
              {aiSummary.next_checks.map((check, idx) => (
                <li key={idx} className="text-sm text-[#6B7280] flex items-start gap-2">
                  <span className="text-[#7C3AED] mt-1 shrink-0">•</span>
                  <span className="break-words">{check}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};
