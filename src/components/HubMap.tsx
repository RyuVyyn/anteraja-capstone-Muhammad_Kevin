import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { formatIndonesianNumber, type MergedHub } from '../lib/metrics/dwell';
import { getPriority, PRIORITY_META } from '../config/priority';

interface HubMapProps {
  hubs: MergedHub[];
  selectedHubId: string | null;
  onSelectHub: (hubId: string) => void;
}

export const HubMap: React.FC<HubMapProps> = ({
  hubs,
  selectedHubId,
  onSelectHub,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center Indonesia [-2.5, 118]
    const map = L.map(mapContainerRef.current, {
      center: [-2.5, 118],
      zoom: 5,
      zoomControl: true,
      attributionControl: true,
    });

    // OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> kontributor',
      maxZoom: 18,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = layerGroup;
    mapInstanceRef.current = map;

    // Resize handling
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
      markersMapRef.current.clear();
    };
  }, []);

  // Update Markers when hubs or selection change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    markersMapRef.current.clear();

    const bounds = L.latLngBounds([]);

    hubs.forEach((hub) => {
      if (hub.lat === undefined || hub.lng === undefined) return;

      const isSelected = selectedHubId === hub.hub_id;
      const priority = getPriority(hub.avg_dwell_hours, hub.package_count);
      const meta = PRIORITY_META[priority];

      // Custom SVG Pin Icon
      const pinColor = meta.markerColor;
      const selectionRing = isSelected
        ? `<div style="position: absolute; top: -6px; left: -6px; width: 44px; height: 44px; border-radius: 50%; border: 3px solid #ED0677; animation: pulse 1.5s infinite; pointer-events: none;"></div>`
        : '';

      const iconHtml = `
        <div style="position: relative; width: 32px; height: 40px;" class="custom-hub-pin ${isSelected ? 'is-selected' : ''}">
          ${selectionRing}
          <svg viewBox="0 0 32 40" width="32" height="40" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 10.5 16 24 16 24s16-13.5 16-24c0-8.837-7.163-16-16-16z" fill="${pinColor}" stroke="#ffffff" stroke-width="2"/>
            <circle cx="16" cy="15" r="6" fill="#ffffff"/>
            <circle cx="16" cy="15" r="3.5" fill="${pinColor}"/>
          </svg>
          <div style="position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: #1E1E24; color: #ffffff; font-size: 10px; font-weight: 800; padding: 1px 5px; border-radius: 4px; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">
            #${hub.rank || '-'}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: iconHtml,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -38],
      });

      const marker = L.marker([hub.lat, hub.lng], {
        icon: customIcon,
        title: `${hub.hub_id} - ${hub.name || ''}`,
        zIndexOffset: isSelected ? 1000 : 0,
      });

      // Popup Content Card with Min/Max Dwell Grid
      const popupContent = `
        <div style="width: 260px; font-family: 'Plus Jakarta Sans', sans-serif; padding: 12px 14px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 800; color: #ED0677; background: #FDF2F8; padding: 2px 6px; border-radius: 4px;">
              Peringkat #${hub.rank || '-'}
            </span>
            <span style="font-size: 11px; font-weight: 700; color: ${meta.textClass.replace('text-', '')}; background: ${meta.bgClass.replace('bg-', '')}; padding: 2px 6px; border-radius: 4px;">
              ${meta.label}
            </span>
          </div>
          <div style="font-size: 15px; font-weight: 800; color: #0B1C30; margin-bottom: 2px;">
            ${hub.hub_id}
          </div>
          <div style="font-size: 12px; color: #64748B; margin-bottom: 10px;">
            ${hub.name}
          </div>
          
          <!-- 2x2 Grid for Mean, Min, Max, Selesai -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;">
            <div style="background: #F8F9FA; border-radius: 6px; padding: 6px 8px; border: 1px solid #E5E7EB;">
              <div style="font-size: 10px; color: #64748B; font-weight: 600;">Mean Dwell</div>
              <div style="font-size: 15px; font-weight: 800; color: #0B1C30;">
                ${formatIndonesianNumber(hub.avg_dwell_hours, 2)} <span style="font-size: 10px; color: #64748B;">jam</span>
              </div>
            </div>
            <div style="background: #F8F9FA; border-radius: 6px; padding: 6px 8px; border: 1px solid #E5E7EB;">
              <div style="font-size: 10px; color: #64748B; font-weight: 600;">Min Dwell</div>
              <div style="font-size: 15px; font-weight: 800; color: #0B1C30;">
                ${formatIndonesianNumber(hub.min_dwell_hours, 2)} <span style="font-size: 10px; color: #64748B;">jam</span>
              </div>
            </div>
            <div style="background: #F8F9FA; border-radius: 6px; padding: 6px 8px; border: 1px solid #E5E7EB;">
              <div style="font-size: 10px; color: #64748B; font-weight: 600;">Max Dwell</div>
              <div style="font-size: 15px; font-weight: 800; color: #0B1C30;">
                ${formatIndonesianNumber(hub.max_dwell_hours, 2)} <span style="font-size: 10px; color: #64748B;">jam</span>
              </div>
            </div>
            <div style="background: #F8F9FA; border-radius: 6px; padding: 6px 8px; border: 1px solid #E5E7EB;">
              <div style="font-size: 10px; color: #64748B; font-weight: 600;">Selesai</div>
              <div style="font-size: 15px; font-weight: 800; color: #0B1C30;">
                ${formatIndonesianNumber(hub.package_count, 0)} <span style="font-size: 10px; color: #64748B;">pkt</span>
              </div>
            </div>
          </div>
          
          ${
            hub.is_placeholder
              ? `<div style="font-size: 10px; color: #B45309; background: #FFFBEB; border: 1px solid #FDE68A; padding: 3px 6px; border-radius: 4px; margin-bottom: 8px; font-weight: 600;">
                  📍 Koordinat sementara
                </div>`
              : ''
          }
          <button
            id="btn-select-${hub.hub_id}"
            style="width: 100%; background: #ED0677; color: #ffffff; border: none; padding: 7px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer;"
          >
            Lihat Detail
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-select-${hub.hub_id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectHub(hub.hub_id);
          };
        }
      });

      marker.on('click', () => {
        onSelectHub(hub.hub_id);
      });

      layer.addLayer(marker);
      markersMapRef.current.set(hub.hub_id, marker);
      bounds.extend([hub.lat, hub.lng]);
    });

    // Fit map bounds when markers exist
    if (bounds.isValid() && hubs.length > 0) {
      if (selectedHubId) {
        const selectedMarker = markersMapRef.current.get(selectedHubId);
        if (selectedMarker) {
          const latLng = selectedMarker.getLatLng();
          map.setView(latLng, Math.max(map.getZoom(), 8), { animate: true });
          selectedMarker.openPopup();
        }
      } else {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
      }
    }
  }, [hubs, selectedHubId, onSelectHub]);

  return (
    <div className="relative w-full h-[520px] sm:h-[560px] bg-slate-100 rounded-xl overflow-hidden border border-[#E5E7EB] shadow-xs">
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[30] bg-white/95 backdrop-blur-xs border border-[#E5E7EB] rounded-lg p-2.5 sm:p-3 shadow-md pointer-events-auto">
        <span className="text-[11px] font-bold text-[#0B1C30] uppercase tracking-wider block mb-1.5">
          Keterangan
        </span>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#DC2626]" />
            <span className="text-[#0B1C30] font-medium">Prioritas</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#10B981]" />
            <span className="text-[#0B1C30] font-medium">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#94A3B8]" />
            <span className="text-[#0B1C30] font-medium">Belum Ada Data</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-[#64748B]">
          Prioritas = rata-rata &gt; 6 jam<br/>(aturan simulasi)
        </div>
      </div>
    </div>
  );
};
