import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Project } from '../../types/project';
import { AurumBadge } from '../common/AurumBadge';
import { ChevronRight } from 'lucide-react';

interface ProjectMapProps {
  projects: Project[];
  selectedProject?: Project;
  onSelectProject: (project: Project) => void;
  onInspectProject: (project: Project) => void;
}

// Custom Leaflet marker icons matching Aurum visual language
const createAurumIcon = (status: string, riskScore: number) => {
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

  const svgHtml = `
    <div style="
      position: relative;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background-color: ${color}25;
        border: 1px solid ${borderColor}60;
        animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
      <div style="
        position: relative;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background-color: ${color};
        border: 2px solid #101318;
        box-shadow: 0 0 10px ${color}80;
      "></div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'aurum-map-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

// Component to dynamically re-center map when active project changes
const MapRecenter: React.FC<{ project?: Project }> = ({ project }) => {
  const map = useMap();
  useEffect(() => {
    if (project && project.lat && project.lng) {
      map.flyTo([project.lat, project.lng], 6, { duration: 1.2 });
    }
  }, [project, map]);
  return null;
};

export const ProjectMap: React.FC<ProjectMapProps> = ({
  projects,
  selectedProject,
  onSelectProject,
  onInspectProject,
}) => {
  // Center of India overview
  const defaultCenter: [number, number] = [21.5, 78.5];

  return (
    <div className="w-full h-[540px] md:h-[620px] rounded-showcase overflow-hidden border border-silver/15 relative z-0 shadow-deep">
      <MapContainer
        center={selectedProject ? [selectedProject.lat, selectedProject.lng] : defaultCenter}
        zoom={5}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* Dark Matter tiles by CartoDB (perfect dark editorial Aurum aesthetic) */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />

        <MapRecenter project={selectedProject} />

        {projects.map(proj => (
          <Marker
            key={proj.id}
            position={[proj.lat, proj.lng]}
            icon={createAurumIcon(proj.status, proj.riskScore)}
            eventHandlers={{
              click: () => onSelectProject(proj),
            }}
          >
            <Popup className="aurum-map-popup">
              <div className="p-2 min-w-[220px] font-sans">
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
                    <span className="text-bone-muted text-[0.62rem] block">COST SPENT</span>
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
                  <span>INSPECT DETAILS</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] bg-obsidian-2/90 backdrop-blur-md border border-silver/15 rounded-xl p-3 shadow-deep text-xs font-mono">
        <span className="mono-label block mb-2">INFRASTRUCTURE ASSET RISK</span>
        <div className="space-y-1.5 text-[0.68rem]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-bone">ON TRACK (Risk &lt; 40)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-bone">WATCH (Risk 40–64)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
            <span className="text-bone">AT RISK (Risk 65–79)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="text-bone">CRITICAL (Risk ≥ 80)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
