import type { GpxPoint } from '../types/gpx';
import { calculateDistance } from './distance';

function perpendicularDistance(pt: GpxPoint, lineStart: GpxPoint, lineEnd: GpxPoint): number {
  const l2 = Math.pow(lineStart.lat - lineEnd.lat, 2) + Math.pow(lineStart.lng - lineEnd.lng, 2);
  if (l2 === 0) return calculateDistance(pt, lineStart);
  
  let t = ((pt.lat - lineStart.lat) * (lineEnd.lat - lineStart.lat) + (pt.lng - lineStart.lng) * (lineEnd.lng - lineStart.lng)) / l2;
  t = Math.max(0, Math.min(1, t));
  
  const projection = {
    lat: lineStart.lat + t * (lineEnd.lat - lineStart.lat),
    lng: lineStart.lng + t * (lineEnd.lng - lineStart.lng)
  };
  return calculateDistance(pt, projection);
}

export function simplifyRDP(points: GpxPoint[], epsilon: number): GpxPoint[] {
  if (points.length < 3) return points;

  let dmax = 0;
  let index = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const d = perpendicularDistance(points[i], points[0], points[end]);
    if (d > dmax) {
      index = i;
      dmax = d;
    }
  }

  if (dmax > epsilon) {
    const left = simplifyRDP(points.slice(0, index + 1), epsilon);
    const right = simplifyRDP(points.slice(index), epsilon);
    return left.slice(0, left.length - 1).concat(right);
  } else {
    return [points[0], points[end]];
  }
}