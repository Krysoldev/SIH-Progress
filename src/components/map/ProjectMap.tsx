import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Project } from '../../types/project';
import { AurumBadge } from '../common/AurumBadge';
import { ScreenId } from '../layout/AurumSidebar';
import {
  ChevronRight,
  Layers,
  Map as MapIcon,
  Navigation,
  ShieldAlert,
  Zap,
  Maximize2,
  TrendingUp,
  DollarSign,
  Clock,
  ExternalLink,
  Compass,
  CheckCircle,
  Eye,
  Sliders,
  SlidersHorizontal
} from 'lucide-react';
import {
  CartoBasemapStyle,
  CARTO_BASEMAPS,
  getCartoTileUrl,
  getSavedCartoApiKey,
  getSavedCartoStyle,
  saveCartoStyle,
  maskApiKey
} from '../../services/cartoService';

interface ProjectMapProps {
  projects: Project[];
  selectedProject?: Project;
  onSelectProject: (project: Project) => void;
  onInspectProject: (project: Project) => void;
  onNavigate?: (screen: ScreenId) => void;
}

// Major National Infrastructure Alignment Corridors
const INFRA_CORRIDORS = [
  {
    id: 'corridor-western',
    name: 'Western Dedicated Freight & High-Speed Transit Spine',
    positions: [
      [28.6139, 77.209] as [number, number], // National Capital (NCR)
      [22.3094, 73.1812] as [number, number], // Vadodara High-Speed Rail Hub
      [18.5204, 73.8567] as [number, number], // Pune-Mumbai Industrial Corridor
    ],
    color: '#e2e8f0',
    dashArray: '8, 8',
    weight: 2.5,
  },
  {
    id: 'corridor-east-north',
    name: 'Northern & North-Eastern Strategic Energy Arc',
    positions: [
      [26.9157, 80.9462] as [number, number], // Lucknow Transport Junction
      [26.7606, 83.3732] as [number, number], // Gorakhpur Transmission
      [26.1445, 91.7362] as [number, number], // Guwahati Brahmaputra Gateway
    ],
    color: '#fb923c',
    dashArray: '6, 6',
    weight: 2,
  },
  {
    id: 'corridor-peninsular',
    name: 'Peninsular Maritime Logistics & Energy Ring',
    positions: [
      [18.5204, 73.8567] as [number, number], // Pune Terminal
      [12.9716, 77.5946] as [number, number], // Bengaluru Smart Mobility Zone
      [20.3168, 86.6111] as [number, number], // Paradip Deep-Sea Maritime Hub
    ],
    color: '#60a5fa',
    dashArray: '4, 8',
    weight: 2,
  },
];

// Custom Leaflet marker icons matching Aurum visual language
const createAurumIcon = (status: string, riskScore: number, isSelected: boolean) => {
  let color = '#34d399'; // on track
  let borderColor = '#a7f3d0';

  if (status === 'CRITICAL' || riskScore >= 80) {
    color = '#f87171';
    borderColor = '#fca5a5';
  } else if (status === 'AT RISK' || riskScore >= 65) {
    color = '#fb923c';
    borderColor = '#fed7aa';
  } else if (status === 'WATCH' || riskScore >= 40) {
    color = '#facc15';
    borderColor = '#fef08a';
  }

  const outerSize = isSelected ? 36 : 28;
  const innerSize = isSelected ? 18 : 14;

  const svgHtml = `
    <div style="
      position: relative;
      width: ${outerSize}px;
      height: ${outerSize}px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        width: ${outerSize}px;
        height: ${outerSize}px;
        border-radius: 50%;
        background-color: ${color}30;
        border: 1px solid ${borderColor}80;
        animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
      <div style="
        position: relative;
        width: ${innerSize}px;
        height: ${innerSize}px;
        border-radius: 50%;
        background-color: ${color};
        border: ${isSelected ? '3px' : '2px'} solid #0b0d11;
        box-shadow: 0 0 ${isSelected ? '16px' : '10px'} ${color}bb;
      "></div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'aurum-map-marker',
    iconSize: [outerSize, outerSize],
    iconAnchor: [outerSize / 2, outerSize / 2],
    popupAnchor: [0, -outerSize / 2],
  });
};

// Component to dynamically re-center map when active project changes
const MapController: React.FC<{ project?: Project; resetTrigger: number }> = ({ project, resetTrigger }) => {
  const map = useMap();

  useEffect(() => {
    if (resetTrigger > 0) {
      map.flyTo([22.0, 79.5], 5, { duration: 1.2 });
    }
  }, [resetTrigger, map]);

  useEffect(() => {
    if (
      project &&
      typeof project.lat === 'number' &&
      !isNaN(project.lat) &&
      typeof project.lng === 'number' &&
      !isNaN(project.lng)
    ) {
      map.flyTo([project.lat, project.lng], 6.5, { duration: 1.2 });
    }
  }, [project, map]);

  return null;
};

export const ProjectMap: React.FC<ProjectMapProps> = ({
  projects,
  selectedProject,
  onSelectProject,
  onInspectProject,
  onNavigate,
}) => {
  // Center of India overview
  const defaultCenter: [number, number] = [21.5, 78.5];

  // Validate coordinates to prevent Leaflet NaN crashes
  const initialCenter: [number, number] =
    selectedProject &&
    typeof selectedProject.lat === 'number' &&
    !isNaN(selectedProject.lat) &&
    typeof selectedProject.lng === 'number' &&
    !isNaN(selectedProject.lng)
      ? [selectedProject.lat, selectedProject.lng]
      : defaultCenter;

  // CARTO Basemap & Layer States
  const [cartoStyle, setCartoStyle] = useState<CartoBasemapStyle>(getSavedCartoStyle);
  const [cartoApiKey] = useState<string>(getSavedCartoApiKey);
  const [showCorridors, setShowCorridors] = useState<boolean>(true);
  const [showGeofences, setShowGeofences] = useState<boolean>(true);
  const [showStyleMenu, setShowStyleMenu] = useState<boolean>(false);
  const [resetCount, setResetCount] = useState<number>(0);

  const handleStyleChange = (style: CartoBasemapStyle) => {
    setCartoStyle(style);
    saveCartoStyle(style);
    setShowStyleMenu(false);
  };

  const activeBasemap = CARTO_BASEMAPS[cartoStyle] || CARTO_BASEMAPS.dark;
  const tileUrl = getCartoTileUrl(cartoStyle, cartoApiKey);

  const getRiskGeofenceProps = (status: string, riskScore: number) => {
    if (status === 'CRITICAL' || riskScore >= 80) {
      return { color: '#f87171', fillColor: '#ef4444', radius: 75000, fillOpacity: 0.16 };
    }
    if (status === 'AT RISK' || riskScore >= 65) {
      return { color: '#fb923c', fillColor: '#f97316', radius: 55000, fillOpacity: 0.12 };
    }
    if (status === 'WATCH' || riskScore >= 40) {
      return { color: '#facc15', fillColor: '#eab308', radius: 45000, fillOpacity: 0.08 };
    }
    return { color: '#34d399', fillColor: '#10b981', radius: 35000, fillOpacity: 0.06 };
  };

  // Safe valid project list
  const validProjects = projects.filter(
    p => p && typeof p.lat === 'number' && !isNaN(p.lat) && typeof p.lng === 'number' && !isNaN(p.lng)
  );

  return (
    <div className="w-full h-[580px] md:h-[680px] rounded-showcase overflow-hidden border border-silver/15 relative z-0 shadow-deep flex flex-col">
      {/* Top Map HUD Controls Overlay */}
      <div className="absolute top-3.5 left-3.5 right-3.5 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* CARTO Verification HUD Badge */}
        <div className="pointer-events-auto flex items-center gap-2 bg-obsidian-2/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-silver/20 shadow-soft font-mono text-[0.68rem]">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-silver-bright font-semibold tracking-wider">
            {activeBasemap.isCarto ? 'CARTO.COM CLOUD' : 'GIS SATELLITE ENGINE'}
          </span>
          <span className="text-bone-muted hidden sm:inline">•</span>
          <span className="text-bone-muted hidden sm:inline" title={cartoApiKey}>
            KEY: {maskApiKey(cartoApiKey)}
          </span>
          <span className="text-[0.62rem] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
            AUTHENTICATED
          </span>
        </div>

        {/* Right Tools HUD: Style Selector, Layer Toggles, Recenter */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-obsidian-2/95 backdrop-blur-md p-1.5 rounded-xl border border-silver/20 shadow-soft">
          {/* Basemap Style Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStyleMenu(!showStyleMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian-3 hover:bg-obsidian-4 border border-silver/15 text-bone text-[0.68rem] font-mono transition-colors"
              title="Change Basemap Style"
            >
              <MapIcon size={13} className="text-silver-bright" />
              <span className="font-semibold">{activeBasemap.label}</span>
            </button>

            {showStyleMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-obsidian-1/98 border border-silver/20 rounded-xl shadow-deep p-1.5 z-[500] space-y-1 backdrop-blur-xl animate-fade-in font-mono">
                <span className="mono-label text-[0.6rem] px-2 py-1 block text-silver">BASEMAP TILES (AUTHENTICATED)</span>
                {(Object.keys(CARTO_BASEMAPS) as CartoBasemapStyle[]).map(styleKey => {
                  const opt = CARTO_BASEMAPS[styleKey];
                  const isCur = opt.id === cartoStyle;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleStyleChange(opt.id)}
                      className={`
                        w-full text-left px-2.5 py-1.5 rounded-lg text-[0.68rem] transition-all flex flex-col
                        ${
                          isCur
                            ? 'bg-silver/20 text-silver-bright font-semibold border border-silver/30'
                            : 'hover:bg-obsidian-3 text-bone-muted hover:text-bone'
                        }
                      `}
                    >
                      <span className="flex items-center justify-between">
                        <span>{opt.label}</span>
                        {isCur && <span className="text-[0.6rem] text-emerald-400">ACTIVE</span>}
                      </span>
                      <span className="text-[0.6rem] text-bone-faint font-normal">{opt.sublabel}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Satellite / Dark Toggle */}
          <button
            onClick={() => handleStyleChange(cartoStyle === 'satellite' ? 'dark' : 'satellite')}
            className={`
              px-2.5 py-1.5 rounded-lg text-[0.68rem] font-mono flex items-center gap-1 transition-all border
              ${
                cartoStyle === 'satellite'
                  ? 'bg-blue-500/20 border-blue-400/40 text-blue-300 font-semibold'
                  : 'bg-obsidian-3 border-transparent text-bone-muted hover:text-bone'
              }
            `}
            title="Toggle Photorealistic Satellite Imagery"
          >
            <Compass size={12} className={cartoStyle === 'satellite' ? 'text-blue-400' : 'text-bone-muted'} />
            <span className="hidden sm:inline">Satellite</span>
          </button>

          {/* Toggle Corridor Alignments */}
          <button
            onClick={() => setShowCorridors(!showCorridors)}
            className={`
              px-2.5 py-1.5 rounded-lg text-[0.68rem] font-mono flex items-center gap-1 transition-all border
              ${
                showCorridors
                  ? 'bg-silver/15 border-silver/30 text-silver-bright'
                  : 'bg-obsidian-3 border-transparent text-bone-muted hover:text-bone'
              }
            `}
            title="Toggle National Transport Corridors"
          >
            <Zap size={12} className={showCorridors ? 'text-amber-400' : 'text-bone-muted'} />
            <span className="hidden sm:inline">Corridors</span>
          </button>

          {/* Toggle Risk Zones */}
          <button
            onClick={() => setShowGeofences(!showGeofences)}
            className={`
              px-2.5 py-1.5 rounded-lg text-[0.68rem] font-mono flex items-center gap-1 transition-all border
              ${
                showGeofences
                  ? 'bg-silver/15 border-silver/30 text-silver-bright'
                  : 'bg-obsidian-3 border-transparent text-bone-muted hover:text-bone'
              }
            `}
            title="Toggle Spatial Risk Geofence Buffers"
          >
            <ShieldAlert size={12} className={showGeofences ? 'text-rose-400' : 'text-bone-muted'} />
            <span className="hidden sm:inline">Risk Buffers</span>
          </button>

          {/* Recenter / Full Extent Button */}
          <button
            onClick={() => setResetCount(c => c + 1)}
            className="p-1.5 rounded-lg bg-obsidian-3 hover:bg-obsidian-4 border border-silver/15 text-silver hover:text-white transition-colors"
            title="Reset Map to Full National Extent"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      <MapContainer
        center={initialCenter}
        zoom={5}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* CARTO Basemap Tiles - authenticated via ?key= & ?api_key= params */}
        <TileLayer
          key={`${cartoStyle}-${cartoApiKey}`}
          attribution={activeBasemap.attribution}
          url={tileUrl}
          subdomains={activeBasemap.subdomains || 'abcd'}
          maxZoom={activeBasemap.maxZoom || 19}
        />

        <MapController project={selectedProject} resetTrigger={resetCount} />

        {/* National Corridor Alignment Polylines */}
        {showCorridors &&
          INFRA_CORRIDORS.map(corridor => (
            <Polyline
              key={corridor.id}
              positions={corridor.positions}
              pathOptions={{
                color: corridor.color,
                dashArray: corridor.dashArray,
                weight: corridor.weight,
                opacity: 0.7,
              }}
            >
              <Popup className="aurum-map-popup">
                <div className="p-2 font-mono text-xs">
                  <span className="mono-label text-[0.6rem] text-amber-400 block mb-1">
                    NATIONAL LOGISTICS ARTERY
                  </span>
                  <p className="text-bone font-medium">{corridor.name}</p>
                </div>
              </Popup>
            </Polyline>
          ))}

        {/* Spatial Risk Geofence Circles */}
        {showGeofences &&
          validProjects.map(p => {
            const geofence = getRiskGeofenceProps(p.status, p.riskScore);
            return (
              <Circle
                key={`geofence-${p.id}`}
                center={[p.lat, p.lng]}
                radius={geofence.radius}
                pathOptions={{
                  color: geofence.color,
                  fillColor: geofence.fillColor,
                  fillOpacity: geofence.fillOpacity,
                  weight: 1,
                  dashArray: p.status === 'CRITICAL' ? '4, 4' : undefined,
                }}
              />
            );
          })}

        {/* Asset Pinpoint Markers */}
        {validProjects.map(proj => {
          const isSelected = proj.id === selectedProject?.id;
          return (
            <Marker
              key={proj.id}
              position={[proj.lat, proj.lng]}
              icon={createAurumIcon(proj.status, proj.riskScore, isSelected)}
              eventHandlers={{
                click: () => onSelectProject(proj),
              }}
            >
              <Popup className="aurum-map-popup">
                <div className="p-2 min-w-[230px] font-sans">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-[0.65rem] text-bone-muted">{proj.code}</span>
                    <AurumBadge status={proj.status} size="sm" />
                  </div>
                  <h4 className="font-display text-sm font-medium text-bone mb-1">{proj.name}</h4>
                  <p className="text-[0.72rem] text-bone-muted mb-2">{proj.location}</p>

                  <div className="grid grid-cols-2 gap-2 py-2 border-y border-silver/10 my-2 font-mono text-[0.7rem]">
                    <div>
                      <span className="text-bone-muted text-[0.62rem] block">PROGRESS</span>
                      <span className="text-bone font-medium">{proj.physicalProgress}%</span>
                    </div>
                    <div>
                      <span className="text-bone-muted text-[0.62rem] block">SPENT</span>
                      <span className="text-bone font-medium">₹{proj.currentExpenditure} Cr</span>
                    </div>
                    <div>
                      <span className="text-bone-muted text-[0.62rem] block">RISK SCORE</span>
                      <span className="text-red-300 font-bold">{proj.riskScore}/100</span>
                    </div>
                    <div>
                      <span className="text-bone-muted text-[0.62rem] block">DELAY</span>
                      <span className="text-amber-300 font-medium">+{proj.prediction.predictedTimeOverrun}m</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onInspectProject(proj)}
                    className="w-full mt-1.5 py-1.5 px-3 rounded-lg bg-obsidian-4 hover:bg-obsidian-5 border border-silver/20 text-silver-bright text-[0.72rem] font-mono tracking-wider flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>INSPECT ASSET</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay in Bottom-Left */}
      <div className="absolute bottom-4 left-4 z-[400] bg-obsidian-2/92 backdrop-blur-md border border-silver/15 rounded-xl p-3 shadow-deep text-xs font-mono max-w-[220px]">
        <div className="flex items-center justify-between mb-2">
          <span className="mono-label text-[0.62rem]">SPATIAL TELEMETRY</span>
          <span className="text-[0.6rem] text-bone-muted">CARTO.COM</span>
        </div>
        <div className="space-y-1.5 text-[0.68rem]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-bone">ON TRACK (&lt;40)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-bone">WATCH (40–64)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
            <span className="text-bone">AT RISK (65–79)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="text-bone">CRITICAL (≥80)</span>
          </div>
          {showCorridors && (
            <div className="pt-1.5 border-t border-silver/10 flex items-center gap-2">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-silver-bright inline-block" />
              <span className="text-bone-muted text-[0.64rem]">Logistics Corridors</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Project Telemetry HUD (when project selected) */}
      {selectedProject && selectedProject.id && (
        <div className="absolute bottom-4 right-4 z-[400] max-w-sm sm:max-w-md bg-obsidian-2/95 backdrop-blur-xl border border-silver/25 rounded-2xl p-4 shadow-deep animate-slide-in-right">
          <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-silver/10">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-silver-bright px-2 py-0.5 rounded bg-obsidian-4 border border-silver/20">
                {selectedProject.code}
              </span>
              <AurumBadge status={selectedProject.status} size="sm" />
            </div>
            <span className="font-mono text-[0.68rem] text-bone-muted">
              {selectedProject.location.split(',')[0]}
            </span>
          </div>

          <h3 className="font-display text-sm font-semibold text-bone mb-1 truncate">
            {selectedProject.name}
          </h3>

          <div className="grid grid-cols-3 gap-2 my-3 py-2 bg-obsidian-3/80 rounded-xl px-3 border border-silver/10 font-mono text-[0.7rem]">
            <div>
              <span className="text-bone-muted text-[0.6rem] block">PROGRESS</span>
              <span className="text-bone font-medium">{selectedProject.physicalProgress}%</span>
            </div>
            <div>
              <span className="text-bone-muted text-[0.6rem] block">EXPENDITURE</span>
              <span className="text-bone font-medium">₹{selectedProject.currentExpenditure} Cr</span>
            </div>
            <div>
              <span className="text-bone-muted text-[0.6rem] block">RISK INDEX</span>
              <span className={`font-bold ${selectedProject.riskScore >= 75 ? 'text-rose-400' : 'text-amber-300'}`}>
                {selectedProject.riskScore}/100
              </span>
            </div>
          </div>

          {/* Quick Nav Actions Bar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onInspectProject(selectedProject)}
              className="flex-1 py-1.5 px-3 rounded-lg bg-silver/15 hover:bg-silver/25 border border-silver/30 text-silver-bright text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye size={13} />
              <span>INSPECT</span>
            </button>
            {onNavigate && (
              <>
                <button
                  onClick={() => {
                    onSelectProject(selectedProject);
                    onNavigate('risk');
                  }}
                  className="py-1.5 px-2.5 rounded-lg bg-obsidian-4 hover:bg-obsidian-5 border border-silver/15 text-bone-muted hover:text-bone text-xs font-mono flex items-center gap-1 transition-colors"
                  title="Open Risk Intelligence Radar"
                >
                  <ShieldAlert size={12} />
                  <span className="hidden sm:inline">Risk</span>
                </button>
                <button
                  onClick={() => {
                    onSelectProject(selectedProject);
                    onNavigate('simulation');
                  }}
                  className="py-1.5 px-2.5 rounded-lg bg-obsidian-4 hover:bg-obsidian-5 border border-silver/15 text-bone-muted hover:text-bone text-xs font-mono flex items-center gap-1 transition-colors"
                  title="Run What-If Simulation"
                >
                  <SlidersHorizontal size={12} />
                  <span className="hidden sm:inline">Sim</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
