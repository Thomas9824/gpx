import type { GpxPoint } from '../types/gpx';
import { calculateDistance } from './distance';
import { simplifyRDP } from './simplifyRoute';

export function selectIntelligentWaypoints(
  points: GpxPoint[], 
  precisionValue: number, // 1 (Simplifié) à 100 (Précis)
  maxWaypoints: number
): GpxPoint[] {
  if (points.length <= maxWaypoints) return points;

  // 1. Epsilon dynamique selon le slider de précision (inversé : plus on est précis, plus epsilon est bas)
  // Epsilon représente une distance en mètres
  const epsilon = Math.max(5, 500 - (precisionValue * 4.95)); 
  
  // 2. Simplification géométrique (RDP)
  let simplified = simplifyRDP(points, epsilon);

  // 3. Élimination des points trop proches (espacement minimum de 100m)
  const MIN_DISTANCE = 100;
  const filtered: GpxPoint[] = [simplified[0]];
  
  for (let i = 1; i < simplified.length - 1; i++) {
    const lastAdded = filtered[filtered.length - 1];
    if (calculateDistance(lastAdded, simplified[i]) > MIN_DISTANCE) {
      filtered.push(simplified[i]);
    }
  }
  // S'assurer de garder le point d'arrivée
  if (calculateDistance(filtered[filtered.length - 1], simplified[simplified.length - 1]) > MIN_DISTANCE) {
    filtered.push(simplified[simplified.length - 1]);
  } else {
    filtered[filtered.length - 1] = simplified[simplified.length - 1];
  }

  // 4. Limiter au maxWaypoints en échantillonnant uniformément si nécessaire
  if (filtered.length > maxWaypoints) {
    const finalPoints: GpxPoint[] = [filtered[0]];
    const step = (filtered.length - 2) / (maxWaypoints - 2);
    
    for (let i = 1; i < maxWaypoints - 1; i++) {
      const index = Math.round(i * step);
      finalPoints.push(filtered[index]);
    }
    finalPoints.push(filtered[filtered.length - 1]);
    return finalPoints;
  }

  return filtered;
}