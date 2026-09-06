import type { GpxPoint } from '../types/gpx';

export function calculateDistance(pt1: GpxPoint, pt2: GpxPoint): number {
  const R = 6371e3; // Rayon de la Terre en mètres
  const rad = Math.PI / 180;
  const lat1 = pt1.lat * rad;
  const lat2 = pt2.lat * rad;
  const deltaLat = (pt2.lat - pt1.lat) * rad;
  const deltaLng = (pt2.lng - pt1.lng) * rad;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Retourne en mètres
}

export function getTotalDistance(points: GpxPoint[]): string {
  if (points.length < 2) return "0 km";
  let totalMeters = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalMeters += calculateDistance(points[i], points[i + 1]);
  }
  const km = totalMeters / 1000;
  // Formatage propre : "42,8 km"
  return `${km.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;
}