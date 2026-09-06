import type { GpxPoint } from '../types/gpx';

export function parseGPX(xmlString: string): GpxPoint[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');
  const points: GpxPoint[] = [];

  // Support des traces et des routes
  const nodes = doc.querySelectorAll('trkpt, rtept');
  
  nodes.forEach(node => {
    const lat = parseFloat(node.getAttribute('lat') || '');
    const lng = parseFloat(node.getAttribute('lon') || '');
    const eleNode = node.querySelector('ele');
    const elevation = eleNode ? parseFloat(eleNode.textContent || '') : undefined;

    if (!isNaN(lat) && !isNaN(lng)) {
      points.push({ lat, lng, elevation: isNaN(elevation as number) ? undefined : elevation });
    }
  });

  if (points.length === 0) {
    throw new Error("Aucun point GPS valide trouvé dans le fichier.");
  }

  return points;
}