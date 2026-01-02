import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon issue
const DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function MapSebaranKelompok({ kelompokList = [], onMarkerClick = null, highlightedMarkerId = null }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef({});

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Only initialize once

    if (!mapContainer.current) {
      console.error('Map container not available');
      return;
    }

    map.current = L.map(mapContainer.current).setView([-7.4, 109.2], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);
    
    console.log('Map initialized');
  }, []);

  // Add/update markers
  useEffect(() => {
    if (!map.current) return;

    // Remove old markers
    Object.values(markersRef.current).forEach(marker => {
      map.current.removeLayer(marker);
    });
    markersRef.current = {};

    // Add new markers
    const bounds = L.latLngBounds([]);
    let hasValidMarkers = false;

    console.log('Processing kelompokList:', kelompokList);

    kelompokList.forEach(kelompok => {
      if (kelompok.latitude && kelompok.longitude) {
        console.log(`Adding marker for ${kelompok.name}: ${kelompok.latitude}, ${kelompok.longitude}`);
        hasValidMarkers = true;
        const marker = L.marker([kelompok.latitude, kelompok.longitude], {
          title: kelompok.name || 'Unknown',
        }).addTo(map.current);

        // Popup content
        const popupContent = `
          <div class="popup-content" style="font-size: 13px;">
            <strong>${kelompok.name || '-'}</strong><br/>
            <small>
              Desa: ${kelompok.desa || '-'}<br/>
              Kecamatan: ${kelompok.kecamatan || '-'}
            </small>
          </div>
        `;
        marker.bindPopup(popupContent);

        // Store marker reference
        markersRef.current[kelompok.id] = marker;

        // Add click listener
        marker.on('click', () => {
          if (onMarkerClick) {
            onMarkerClick(kelompok);
          }
        });

        bounds.extend([kelompok.latitude, kelompok.longitude]);
      }
    });

    // Auto fit bounds if markers exist
    if (hasValidMarkers && bounds.isValid()) {
      map.current.fitBounds(bounds, { padding: [50, 50] });
      console.log('Map fitted to bounds');
    } else {
      console.warn('No valid markers found. KelompokList:', kelompokList);
    }
  }, [kelompokList, onMarkerClick]);

  // Highlight specific marker
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      if (Number(id) === highlightedMarkerId) {
        marker.openPopup();
        // Optional: zoom to marker
        map.current.setView(marker.getLatLng(), 15);
      }
    });
  }, [highlightedMarkerId]);

  return (
    <div 
      ref={mapContainer}
      className="w-full h-96 md:h-[600px] rounded-lg shadow-md"
      style={{ minHeight: '500px' }}
    />
  );
}
