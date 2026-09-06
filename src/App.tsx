import React, { useState, useEffect } from 'react';
import { UploadCloud, File, Map, Sliders, Navigation, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { GpxPoint } from './types/gpx';
import { parseGPX } from './lib/gpxParser';
import { getTotalDistance } from './lib/distance';
import { selectIntelligentWaypoints } from './lib/waypointSelector';
import { generateAppleMapsUrl } from './lib/appleMaps';
import { RouteMap } from './components/RouteMap';

export default function App() {
  const [fileData, setFileData] = useState<{ name: string, points: GpxPoint[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Contrôles
  const [precision, setPrecision] = useState<number>(50);
  const [maxWaypoints, setMaxWaypoints] = useState<number>(30);
  const [transportMode, setTransportMode] = useState<string>('Vélo');
  
  // Résultat
  const [waypoints, setWaypoints] = useState<GpxPoint[]>([]);

  // Gestion du Drag & Drop / Fichier
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.gpx')) {
      setError("Le fichier doit être au format .gpx");
      return;
    }

    try {
      const text = await file.text();
      const parsedPoints = parseGPX(text);
      setFileData({ name: file.name, points: parsedPoints });
    } catch (err: any) {
      setError("Impossible de lire le fichier GPX. " + err.message);
    }
  };

  // Mise à jour réactive des waypoints
  useEffect(() => {
    if (fileData) {
      const wps = selectIntelligentWaypoints(fileData.points, precision, maxWaypoints);
      setWaypoints(wps);
    }
  }, [fileData, precision, maxWaypoints]);

  const handleOpenAppleMaps = () => {
    if (!waypoints.length) return;
    const url = generateAppleMapsUrl(waypoints, transportMode);
    
    // Anticiper les URLs trop longues (les navigateurs bloquent souvent > 2000 chars)
    if (url.length > 2000) {
      setError("L'itinéraire est trop complexe, l'URL générée est trop longue. Réduis le nombre de waypoints.");
      return;
    }
    
    window.open(url, '_blank');
  };

  const isComplex = waypoints.length >= 50;

  return (
    <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-8 text-center bg-gray-50/50 border-b border-gray-100">
          <div className="flex justify-center items-center gap-3 mb-2">
            <Map className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-semibold tracking-tight">GPX →  Plans</h1>
          </div>
          <p className="text-gray-500">Transforme ton fichier GPX en itinéraire navigable</p>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Messages d'erreur */}
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Zone d'Import */}
          {!fileData ? (
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-50 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <label className="relative border-2 border-dashed border-gray-200 rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer bg-white hover:border-blue-500 hover:bg-blue-50/50 transition-all">
                <UploadCloud className="w-12 h-12 text-blue-500 mb-4" />
                <span className="font-semibold text-gray-700 text-lg">Dépose ton fichier GPX ici</span>
                <span className="text-sm text-gray-400 mt-2">ou</span>
                <span className="mt-4 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-colors">
                  Choisir un fichier
                </span>
                <span className="text-xs text-gray-400 mt-4">Formats supportés : .gpx</span>
                <input type="file" accept=".gpx" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          ) : (
            
            /* Interface post-import */
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Infos Fichier */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                    <File className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{fileData.name}</h3>
                    <p className="text-sm text-gray-500">
                      {getTotalDistance(fileData.points)} • {fileData.points.length.toLocaleString('fr-FR')} points
                    </p>
                  </div>
                </div>
                <label className="text-sm text-blue-600 font-medium cursor-pointer hover:underline">
                  Remplacer
                  <input type="file" accept=".gpx" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>

              {/* Carte */}
              <RouteMap originalPoints={fileData.points} waypoints={waypoints} />

              {/* Contrôles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                
                {/* Précision Slider */}
                <div className="space-y-3 sm:col-span-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Sliders className="w-4 h-4" /> Précision du tracé
                    </label>
                  </div>
                  <input 
                    type="range" min="1" max="100" 
                    value={precision} onChange={(e) => setPrecision(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 font-medium">
                    <span>Simplifié</span>
                    <span>Précis</span>
                  </div>
                </div>

                {/* Sélecteurs */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Max Waypoints</label>
                  <select 
                    value={maxWaypoints} onChange={(e) => setMaxWaypoints(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    {[10, 15, 20, 25, 30, 40, 50, 75, 100].map(n => (
                      <option key={n} value={n}>{n} waypoints</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Mode</label>
                  <select 
                    value={transportMode} onChange={(e) => setTransportMode(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="Voiture">🚗 Voiture</option>
                    <option value="Vélo">🚴 Vélo</option>
                    <option value="À pied">🚶 À pied</option>
                  </select>
                </div>
              </div>

              {/* Bilan & Bouton */}
              <div className="space-y-4 pt-2">
                <div className={`flex items-center justify-center gap-2 text-sm font-medium ${isComplex ? 'text-orange-500' : 'text-green-600'}`}>
                  {isComplex ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                  {isComplex ? 'Parcours complexe (risque de coupure sur Apple Plans)' : 'Compatible avec Apple Plans'}
                  <span className="text-gray-400 ml-2">({waypoints.length} retenus)</span>
                </div>

                <button 
                  onClick={handleOpenAppleMaps}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-transform active:scale-[0.98] shadow-lg shadow-slate-900/20"
                >
                  <Navigation className="w-5 h-5" />
                   Ouvrir dans Apple Plans
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}