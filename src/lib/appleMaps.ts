import type { GpxPoint } from '../types/gpx';

export function generateAppleMapsUrl(waypoints: GpxPoint[], transportMode: string): string {
  if (waypoints.length < 2) return "";

  const start = waypoints[0];
  const destination = waypoints[waypoints.length - 1];
  
  // Apple Maps URL Parameters:
  // d (Drive), w (Walk), r (Transit). iOS 14+ introduced cycling, historically generic mapping uses 'c' or we fallback to 'd' if unsupported.
  let dirflg = 'd'; 
  if (transportMode === 'Vélo') dirflg = 'c'; // Note: Cycling support depends on iOS locale/version
  if (transportMode === 'À pied') dirflg = 'w';

  const baseUrl = 'https://maps.apple.com/';
  const url = new URL(baseUrl);
  
  url.searchParams.append('saddr', `${start.lat},${start.lng}`);
  url.searchParams.append('daddr', `${destination.lat},${destination.lng}`);
  url.searchParams.append('dirflg', dirflg);
  url.searchParams.append('t', 'm'); // Standard map view

  // L'API web officielle d'Apple Maps n'a pas de paramètre tableau documenté pour les waypoints (ex: &waypoint=).
  // Nous injectons les paramètres de façon conceptuelle pour que l'app passe les datas.
  // Sur iOS récent, cela peut ouvrir les stops, sinon l'OS routera direct de saddr à daddr.
  const intermediates = waypoints.slice(1, -1);
  intermediates.forEach(wp => {
    url.searchParams.append('daddr', `${wp.lat},${wp.lng}`);
  });

  return url.toString();
}