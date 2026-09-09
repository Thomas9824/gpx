import type { GpxPoint } from '../types/gpx';

export function generateGoogleMapsUrl(waypoints: GpxPoint[], transportMode: string): string {
  if (waypoints.length < 2) return "";

  // Limite Google Maps Web/URL : max 10 points (origin, destination + 8 waypoints max)
  // ou 25 via API directions, mais via URL d'itinéraire web standard, max 10 points
  let safeWaypoints = waypoints;
  if (waypoints.length > 10) {
    safeWaypoints = [waypoints[0]];
    const step = (waypoints.length - 2) / 8;
    for (let i = 1; i <= 8; i++) {
      safeWaypoints.push(waypoints[Math.round(i * step)]);
    }
    safeWaypoints.push(waypoints[waypoints.length - 1]);
  }

  const origin = safeWaypoints[0];
  const destination = safeWaypoints[safeWaypoints.length - 1];
  const intermediates = safeWaypoints.slice(1, -1);

  // Modes Google Maps : 'driving' (défaut), 'bicycling', 'walking', 'transit'
  let travelmode = 'driving';
  if (transportMode === 'Vélo') travelmode = 'bicycling';
  if (transportMode === 'À pied') travelmode = 'walking';

  const baseUrl = 'https://www.google.com/maps/dir/?api=1';
  const url = new URL(baseUrl);

  url.searchParams.set('origin', `${origin.lat},${origin.lng}`);
  url.searchParams.set('destination', `${destination.lat},${destination.lng}`);
  url.searchParams.set('travelmode', travelmode);

  if (intermediates.length > 0) {
    const waypointsStr = intermediates
      .map(pt => `${pt.lat},${pt.lng}`)
      .join('|');
    url.searchParams.set('waypoints', waypointsStr);
  }

  return url.toString();
}
