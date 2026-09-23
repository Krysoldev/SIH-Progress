import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { Project, ProjectStatus } from '../types/project';
import { ScreenId } from '../components/layout/AurumSidebar';
import { AurumCard } from '../components/common/AurumCard';
import { AurumBadge } from '../components/common/AurumBadge';
import { ActiveProjectsTable } from '../components/project/ActiveProjectsTable';
import {
  LayoutGrid,
  List,
  Filter,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

interface ProjectsPageProps {
  onNavigate: (screen: ScreenId) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onNavigate }) => {
  const { projects, setSelectedProject, searchQuery, setSearchQuery } = useProjects();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const categories = ['ALL', 'Highways & Expressways', 'Rail Transit & Metros', 'Bridges & Tunnels', 'Ports & Maritime', 'Energy Infrastructure'];
  const statuses = ['ALL', 'CRITICAL', 'AT RISK', 'WATCH', 'ON TRACK'];

  const filtered = projects.filter(p => {
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleInspect = (p: Project) => {
    setSelectedProject(p);
    onNavigate('details');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-silver/10 pb-5">
        <div>
          <span className="mono-label">CAPITAL ASSET INVENTORY</span>
          <h1 className="font-display text-3xl md:text-4xl text-bone font-light tracking-tight mt-0.5">
            PROJECT PORTFOLIO
          </h1>
          <p className="text-bone-muted text-xs md:text-sm mt-1">
            Monitoring {projects.length} major infrastructure packages across India.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 rounded-lg bg-obsidian-3 border border-silver/10">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-obsidian-5 text-silver-bright' : 'text-bone-muted hover:text-bone'}`}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-obsidian-5 text-silver-bright' : 'text-bone-muted hover:text-bone'}`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-obsidian-2/80 border border-silver/10 text-xs font-mono">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-bone-muted flex items-center gap-1">
            <Filter size={13} />
            <span>STATUS:</span>
          </span>
          {statuses.map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`
                px-2.5 py-1 rounded-full text-[0.68rem] transition-colors
                ${selectedStatus === st ? 'bg-silver-bright text-obsidian-0 font-semibold' : 'bg-obsidian-3 text-bone-muted hover:text-bone'}
              `}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-2">
          <span className="text-bone-muted">SECTOR:</span>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-obsidian-3 border border-silver/15 rounded-lg px-2.5 py-1 text-bone text-xs font-sans focus:outline-none focus:border-silver"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'table' ? (
        <AurumCard variant="showcase" className="p-5 md:p-6">
          <ActiveProjectsTable
            projects={filtered}
            onSelectProject={handleInspect}
          />
        </AurumCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(proj => (
            <AurumCard
              key={proj.id}
              variant="showcase"
              className="p-5 flex flex-col justify-between hover:border-silver/30 transition-all cursor-pointer group"
              onClick={() => handleInspect(proj)}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[0.65rem] text-bone-muted">{proj.code}</span>
                  <AurumBadge status={proj.status} size="sm" pulse={proj.status === 'CRITICAL'} />
                </div>

                <h3 className="font-display text-lg text-bone font-medium group-hover:text-silver-bright transition-colors line-clamp-1">
                  {proj.name}
                </h3>
                <p className="text-xs text-bone-muted flex items-center gap-1 mt-1 mb-4">
                  <MapPin size={12} className="shrink-0" />
                  <span className="truncate">{proj.location}</span>
                </p>

                {/* Progress bar */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-bone-muted">PHYSICAL COMPLETION</span>
                    <span className="text-bone font-bold">{proj.physicalProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-obsidian-4 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-silver-deep to-silver-bright rounded-full"
                      style={{ width: `${proj.physicalProgress}%` }}
                    />
                  </div>
                </div>

                {/* Metric grid */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-obsidian-3/80 border border-silver/5 font-mono text-xs mb-4">
                  <div>
                    <span className="text-bone-muted text-[0.62rem] block">EXPENDITURE</span>
                    <span className="text-bone font-medium">₹{proj.currentExpenditure} / {proj.plannedCost} Cr</span>
                  </div>
                  <div>
                    <span className="text-bone-muted text-[0.62rem] block">RISK SCORE</span>
                    <span className={`font-bold ${proj.riskScore >= 75 ? 'text-red-300' : proj.riskScore >= 50 ? 'text-amber-300' : 'text-emerald-300'}`}>
                      {proj.riskScore} / 100
                    </span>
                  </div>
                  <div>
                    <span className="text-bone-muted text-[0.62rem] block">SCHEDULE DELAY</span>
                    <span className="text-amber-300">+{proj.prediction.predictedTimeOverrun} mos</span>
                  </div>
                  <div>
                    <span className="text-bone-muted text-[0.62rem] block">CPI / SPI</span>
                    <span className="text-silver">{proj.evm.cpi} / {proj.evm.spi}</span>
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="pt-3 border-t border-silver/10 flex items-center justify-between text-xs font-mono text-silver">
                <span>INSPECT CONTROL PANEL</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </AurumCard>
          ))}
        </div>
      )}
    </div>
  );
};
