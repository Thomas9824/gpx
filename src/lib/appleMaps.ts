import type { GpxPoint } from '../types/gpx';

export function generateAppleMapsUrl(waypoints: GpxPoint[], transportMode: string): string {
  if (waypoints.length < 2) return "";

  // 1. Limite stricte d'Apple : 15 points maximum (1 départ + 14 destinations)
  let safeWaypoints = waypoints;
  if (waypoints.length > 15) {
    safeWaypoints = [waypoints[0]];
    const step = (waypoints.length - 2) / 13;
    for (let i = 1; i < 14; i++) {
      safeWaypoints.push(waypoints[Math.round(i * step)]);
    }
    safeWaypoints.push(waypoints[waypoints.length - 1]);
  }

  const start = safeWaypoints[0];
  
  // 2. GESTION DU BLOCAGE APPLE (Mode Voiture obligatoire pour les waypoints)
  let dirflg = 'd'; // Voiture par défaut
  
  if (safeWaypoints.length <= 2) {
    // S'il n'y a que Départ et Arrivée, Apple accepte le vélo et la marche
    if (transportMode === 'Vélo') dirflg = 'c';
    if (transportMode === 'À pied') dirflg = 'w';
  }
  // Si > 2 points, on garde 'd' (Voiture) car sinon Apple efface tous les points intermédiaires.

  const baseUrl = 'https://maps.apple.com/';
  const url = new URL(baseUrl);
  
  url.searchParams.append('saddr', `${start.lat},${start.lng}`);
  url.searchParams.append('dirflg', dirflg);
  url.searchParams.append('t', 'm');

  // 3. Ajout des étapes
  for (let i = 1; i < safeWaypoints.length; i++) {
    url.searchParams.append('daddr', `${safeWaypoints[i].lat},${safeWaypoints[i].lng}`);
  }

  return url.toString();
}