import React, { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

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

export default function MapPickerKelompok({ latitude, longitude, onLocationChange }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markerRef = useRef(null);
  const [isLocating, setIsLocating] = useState(false);

  // Update marker position
  const updateMarker = useCallback((lat, lng) => {
    if (markerRef.current) {
      map.current.removeLayer(markerRef.current);
    }

    markerRef.current = L.marker([lat, lng], {
      draggable: true,
    }).addTo(map.current);

    // Update callback
    onLocationChange({ latitude: lat, longitude: lng });

    // Handle marker drag
    markerRef.current.on('dragend', (e) => {
      const { lat, lng } = e.target.getLatLng();
      onLocationChange({ latitude: lat, longitude: lng });
    });

    // Show popup
    markerRef.current.bindPopup(
      `<div style="font-size: 12px;">Lat: ${lat.toFixed(6)}<br/>Lng: ${lng.toFixed(6)}</div>`
    ).openPopup();

    map.current.setView([lat, lng], 15);
  }, [onLocationChange]);

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    map.current = L.map(mapContainer.current).setView([-7.4, 109.2], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Handle map clicks to place/update marker
    map.current.on('click', (e) => {
      const { lat, lng } = e.latlng;
      updateMarker(lat, lng);
    });
  }, [updateMarker]);

  // Use current GPS location
  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          updateMarker(lat, lng);
          setIsLocating(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Gagal mendapatkan lokasi GPS. Silakan coba lagi atau pilih langsung di peta.');
          setIsLocating(false);
        }
      );
    } else {
      alert('Browser Anda tidak mendukung geolocation.');
      setIsLocating(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pilih Lokasi di Peta
        </label>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <MapPin size={18} />
          {isLocating ? 'Mengambil lokasi...' : 'Gunakan Lokasi Saat Ini (GPS)'}
        </button>
        <p className="text-xs text-gray-500 mt-2">
          ðŸ’¡ Klik pada peta untuk memilih lokasi, atau gunakan tombol GPS di atas. Marker dapat digeser untuk koreksi.
        </p>
      </div>

      <div 
        ref={mapContainer}
        className="w-full rounded-lg shadow-md border border-gray-300"
        style={{ minHeight: '400px' }}
      />

      {latitude && longitude && (
        <div className="mt-3 p-3 bg-success-50 border border-success-100 rounded-lg text-sm text-green-800">
          âœ“ Lokasi dipilih: <strong>Lat {latitude.toFixed(6)}, Lng {longitude.toFixed(6)}</strong>
        </div>
      )}
    </div>
  );
}

