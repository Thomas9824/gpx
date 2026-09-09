  import React, { useState, useMemo } from 'react';
import { UploadCloud, File, Map, Sliders, Navigation, AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react';
import type { GpxPoint } from './types/gpx';
import { parseGPX } from './lib/gpxParser';
import { getTotalDistance } from './lib/distance';
import { selectIntelligentWaypoints } from './lib/waypointSelector';
import { generateAppleMapsUrl } from './lib/appleMaps';
import { generateGoogleMapsUrl } from './lib/googleMaps';
import { RouteMap } from './components/RouteMap';

type MapProvider = 'apple' | 'google';

export default function App() {
  const [fileData, setFileData] = useState<{ name: string, points: GpxPoint[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [mapProvider, setMapProvider] = useState<MapProvider>('apple');
  const [precision, setPrecision] = useState<number>(50);
  const [maxWaypoints, setMaxWaypoints] = useState<number>(15);
  const [transportMode, setTransportMode] = useState<string>('Vélo');

  const waypoints = useMemo(() => {
    if (!fileData) return [];
    return selectIntelligentWaypoints(fileData.points, precision, maxWaypoints);
  }, [fileData, precision, maxWaypoints]);

  const handleProviderChange = (provider: MapProvider) => {
    setMapProvider(provider);
    if (provider === 'google' && maxWaypoints > 10) {
      setMaxWaypoints(10);
    } else if (provider === 'apple' && maxWaypoints > 15) {
      setMaxWaypoints(15);
    }
  };

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

  const handleOpenMaps = () => {
    if (!waypoints.length) return;
    const url = mapProvider === 'apple'
      ? generateAppleMapsUrl(waypoints, transportMode)
      : generateGoogleMapsUrl(waypoints, transportMode);
    window.open(url, '_blank');
  };

  const providerMaxLimit = mapProvider === 'apple' ? 15 : 10;
  const isComplex = waypoints.length > providerMaxLimit;
  const isAppleBlockingMode = mapProvider === 'apple' && (transportMode === 'Vélo' || transportMode === 'À pied') && waypoints.length > 2;

  return (
    <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        
        <div className="p-8 text-center bg-gray-50/50 border-b border-gray-100">
          <div className="flex justify-center items-center gap-3 mb-2">
            <Map className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-semibold tracking-tight">GPX → Itinéraire</h1>
          </div>
          <p className="text-gray-500">Transforme ton fichier GPX en itinéraire navigable pour Apple Plans ou Google Maps</p>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

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
                <input type="file" accept=".gpx" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
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

              <RouteMap originalPoints={fileData.points} waypoints={waypoints} />

              {/* Choix de l'application GPS */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">Application GPS</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleProviderChange('apple')}
                    className={`py-3 px-4 rounded-2xl font-medium border flex items-center justify-center gap-2 transition-all ${
                      mapProvider === 'apple'
                        ? 'border-black bg-slate-900 text-white shadow-md'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span> Apple Plans</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleProviderChange('google')}
                    className={`py-3 px-4 rounded-2xl font-medium border flex items-center justify-center gap-2 transition-all ${
                      mapProvider === 'google'
                        ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-bold">G</span>
                    <span>Google Maps</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-3xl border border-gray-100">
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
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Max Waypoints ({mapProvider === 'apple' ? '15 max recommandé' : '10 max URL'})
                  </label>
                  <select 
                    value={maxWaypoints} onChange={(e) => setMaxWaypoints(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl outline-none"
                  >
                    {(mapProvider === 'apple' ? [5, 8, 10, 15, 20, 25] : [3, 5, 8, 10, 15, 20]).map(n => (
                      <option key={n} value={n}>{n} waypoints</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Mode</label>
                  <select 
                    value={transportMode} onChange={(e) => setTransportMode(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl outline-none"
                  >
                    <option value="Voiture">🚗 Voiture</option>
                    <option value="Vélo">🚴 Vélo</option>
                    <option value="À pied">🚶 À pied</option>
                  </select>
                </div>
              </div>

              {/* MESSAGE EXPLICATIF DES LIMITES */}
              {isAppleBlockingMode && (
                <div className="p-4 bg-orange-50/80 border border-orange-200 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-orange-600 mt-0.5" />
                  <p className="text-sm text-orange-800 leading-relaxed">
                    <strong>Limitation d'Apple :</strong> Apple Plans refuse les étapes multiples en mode Vélo ou Piéton. L'itinéraire va s'ouvrir en <strong>mode Voiture</strong> pour forcer Apple à conserver ton tracé complet.
                  </p>
                </div>
              )}

              {mapProvider === 'google' && (
                <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 flex-shrink-0 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-800 leading-relaxed">
                    <strong>Google Maps :</strong> Le mode de transport choisi ({transportMode}) sera respecté. L'itinéraire web Google Maps supporte un départ, une arrivée et jusqu'à 8 points intermédiaires (10 au total).
                  </p>
                </div>
              )}

              <div className="space-y-4 pt-2">
                <div className={`flex items-center justify-center gap-2 text-sm font-medium ${isComplex ? 'text-orange-500' : 'text-green-600'}`}>
                  {isComplex ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                  {isComplex 
                    ? `Au-delà de ${providerMaxLimit} points, ${mapProvider === 'apple' ? 'Apple Plans' : 'Google Maps'} ignorera certains arrêts` 
                    : `Totalement compatible avec ${mapProvider === 'apple' ? 'Apple Plans' : 'Google Maps'}`}
                </div>

                <button 
                  onClick={handleOpenMaps}
                  className={`w-full text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg ${
                    mapProvider === 'apple'
                      ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25'
                  }`}
                >
                  <Navigation className="w-5 h-5" />
                  {mapProvider === 'apple' ? ' Ouvrir dans Apple Plans' : 'Ouvrir dans Google Maps'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}