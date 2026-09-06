import type { GpxPoint } from '../types/gpx';

export function generateAppleMapsUrl(waypoints: GpxPoint[], transportMode: string): string {
  if (waypoints.length < 2) return "";

  // 1. GESTION DE LA LIMITE APPLE (Max 15 points)
  // Apple Plans supporte un maximum de 15 arrêts (1 départ + 14 daddr).
  // Si le GPX contient plus de 15 waypoints, on recalcule un échantillon parfait de 15 points
  // pour que l'ouverture ne plante jamais sur iOS.
  let safeWaypoints = waypoints;
  if (waypoints.length > 15) {
    safeWaypoints = [waypoints[0]]; // On garde le départ
    const step = (waypoints.length - 2) / 13;
    for (let i = 1; i < 14; i++) {
      safeWaypoints.push(waypoints[Math.round(i * step)]); // On répartit 13 points intermédiaires
    }
    safeWaypoints.push(waypoints[waypoints.length - 1]); // On garde l'arrivée
  }

  const start = safeWaypoints[0];
  
  // 2. MODE DE TRANSPORT
  let dirflg = 'd'; // d = driving (voiture)
  if (transportMode === 'Vélo') dirflg = 'c'; // c = cycling (vélo - iOS 14+)
  if (transportMode === 'À pied') dirflg = 'w'; // w = walking (marche)

  const baseUrl = 'https://maps.apple.com/';
  const url = new URL(baseUrl);
  
  // 3. POINT DE DÉPART
  url.searchParams.append('saddr', `${start.lat},${start.lng}`);
  url.searchParams.append('dirflg', dirflg);
  url.searchParams.append('t', 'm'); // m = standard map

  // 4. DESTINATIONS CHRONOLOGIQUES (CORRECTION DU BUG)
  // On boucle à partir de l'index 1. 
  // Apple va lire ces "daddr" successifs comme des étapes dans l'ordre, jusqu'à la destination finale.
  for (let i = 1; i < safeWaypoints.length; i++) {
    url.searchParams.append('daddr', `${safeWaypoints[i].lat},${safeWaypoints[i].lng}`);
  }

  return url.toString();
}