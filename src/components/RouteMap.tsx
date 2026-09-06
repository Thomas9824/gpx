import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GpxPoint } from '../types/gpx';

// Correction de l'icône par défaut de Leaflet dans React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Composant pour recentrer la carte automatiquement
function MapBounds({ points }: { points: GpxPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [points, map]);
  return null;
}

export const RouteMap: React.FC<{ originalPoints: GpxPoint[], waypoints: GpxPoint[] }> = ({ originalPoints, waypoints }) => {
  return (
    <div className="h-64 sm:h-96 w-full rounded-2xl overflow-hidden shadow-sm border border-gray-200 z-0 relative">
      <MapContainer center={[46.603354, 1.888334]} zoom={5} className="h-full w-full">
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {/* Tracé Original */}
        {originalPoints.length > 0 && (
          <Polyline 
            positions={originalPoints.map(p => [p.lat, p.lng])} 
            color="#3b82f6" 
            weight={4} 
            opacity={0.6} 
          />
        )}
        
        {/* Waypoints Calculés */}
        {waypoints.map((wp, i) => {
          const isStart = i === 0;
          const isEnd = i === waypoints.length - 1;
          
          // Création d'icônes HTML personnalisées (comme demandé : vert, bleu, rouge)
          const color = isStart ? 'bg-green-500' : isEnd ? 'bg-red-500' : 'bg-blue-500';
          const customIcon = L.divIcon({
            className: 'custom-icon',
            html: `<div class="w-6 h-6 ${color} text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-md">${isStart ? 'D' : isEnd ? 'A' : i}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          return (
            <Marker key={i} position={[wp.lat, wp.lng]} icon={customIcon} />
          );
        })}
        
        <MapBounds points={originalPoints} />
      </MapContainer>
    </div>
  );
};