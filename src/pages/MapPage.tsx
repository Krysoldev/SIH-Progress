import React from 'react';
import { useProjects } from '../context/ProjectContext';
import { ScreenId } from '../components/layout/AurumSidebar';
import { ProjectMap } from '../components/map/ProjectMap';
import { AurumCard } from '../components/common/AurumCard';
import { AurumBadge } from '../components/common/AurumBadge';
import { Project } from '../types/project';
import { MapPin, ArrowRight, ShieldAlert, Layers } from 'lucide-react';

interface MapPageProps {
  onNavigate: (screen: ScreenId) => void;
}

export const MapPage: React.FC<MapPageProps> = ({ onNavigate }) => {
  const { projects, selectedProject, setSelectedProject } = useProjects();

  const handleInspect = (p: Project) => {
    setSelectedProject(p);
    onNavigate('details');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Title Header */}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-silver/10 pb-5">
        <div>
          <span className="mono-label">SPATIAL INFRASTRUCTURE TELEMETRY</span>
          <h1 className="font-display text-3xl md:text-4xl text-bone font-light tracking-tight mt-0.5">
            GIS ASSET MAP
          </h1>
          <p className="text-bone-muted text-xs md:text-sm mt-1">
            Geographic risk distribution, corridor alignments, and site execution signals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-bone-muted bg-obsidian-2 px-3 py-1.5 rounded-full border border-silver/10">
            {projects.length} Geo-Referenced Assets
          </span>
        </div>
      </div>

      {/* Map Display */}
      <ProjectMap
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        onInspectProject={handleInspect}
      />

      {/* Quick Select Project Corridor Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="mono-label">ASSET SELECTION SHORTCUTS</span>
          <span className="font-mono text-[0.68rem] text-bone-muted">CLICK TO CENTER MAP</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.map(p => {
            const isSelected = p.id === selectedProject?.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedProject(p)}
                className={`
                  p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3
                  ${
                    isSelected
                      ? 'bg-obsidian-3 border-silver/40 shadow-soft'
                      : 'bg-obsidian-2/80 border-silver/10 hover:border-silver/25 hover:bg-obsidian-3/50'
                  }
                `}
              >
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[0.62rem] text-bone-muted">{p.code}</span>
                    <AurumBadge status={p.status} size="sm" />
                  </div>
                  <h4 className="font-display text-xs font-medium text-bone truncate">{p.name}</h4>
                  <p className="font-mono text-[0.65rem] text-bone-muted truncate mt-0.5">
                    {p.location.split(',')[0]} • Risk: {p.riskScore}/100
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInspect(p);
                  }}
                  title="Inspect Details"
                  className="p-1.5 rounded-lg bg-obsidian-4 hover:bg-obsidian-5 border border-silver/15 text-silver shrink-0 transition-colors"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
