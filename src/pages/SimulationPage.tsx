import React from 'react';
import { useProjects } from '../context/ProjectContext';
import { ScreenId } from '../components/layout/AurumSidebar';
import { SimulationSliders } from '../components/simulation/SimulationSliders';
import { AurumBadge } from '../components/common/AurumBadge';
import { SlidersHorizontal, Sparkles, Building2 } from 'lucide-react';

interface SimulationPageProps {
  onNavigate: (screen: ScreenId) => void;
}

export const SimulationPage: React.FC<SimulationPageProps> = ({ onNavigate }) => {
  const { selectedProject, projects, setSelectedProject } = useProjects();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-silver/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="mono-label">DYNAMIC SCENARIO LABORATORY</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-mono text-[0.68rem] text-bone-muted">MONTE CARLO PROJECTION</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-bone font-light tracking-tight">
            WHAT-IF SCENARIO SIMULATION
          </h1>
          <p className="text-bone-muted text-xs md:text-sm mt-1">
            Evaluate capital recovery levers, schedule compression strategies, and inflation shocks.
          </p>
        </div>

        {/* Project Context Switcher */}
        <div className="flex items-center gap-2 bg-obsidian-2 border border-silver/15 rounded-xl px-3 py-1.5">
          <Building2 size={15} className="text-silver-deep" />
          <span className="font-mono text-xs text-bone-muted">PROJECT:</span>
          <select
            value={selectedProject.id}
            onChange={e => {
              const found = projects.find(item => item.id === e.target.value);
              if (found) setSelectedProject(found);
            }}
            className="bg-transparent text-bone text-xs font-sans focus:outline-none cursor-pointer"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id} className="bg-obsidian-2 text-bone">
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Simulation Sliders & Dynamic Readout */}
      <SimulationSliders project={selectedProject} />
    </div>
  );
};
