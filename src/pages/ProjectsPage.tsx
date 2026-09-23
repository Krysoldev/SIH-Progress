import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { useNotification } from '../context/NotificationContext';
import { Project, ProjectStatus } from '../types/project';
import { ScreenId } from '../components/layout/AurumSidebar';
import { AurumCard } from '../components/common/AurumCard';
import { AurumBadge } from '../components/common/AurumBadge';
import { AurumModal } from '../components/common/AurumModal';
import { AurumButton } from '../components/common/AurumButton';
import { ActiveProjectsTable } from '../components/project/ActiveProjectsTable';
import {
  LayoutGrid,
  List,
  Filter,
  ArrowRight,
  MapPin,
  Plus,
  Building2,
  Calendar,
  Layers,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';

interface ProjectsPageProps {
  onNavigate: (screen: ScreenId) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onNavigate }) => {
  const { projects, setSelectedProject, searchQuery, createProject } = useProjects();
  const { notify } = useNotification();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Project Form State
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCategory, setNewCategory] = useState<Project['category']>('Highways & Expressways');
  const [newLocation, setNewLocation] = useState('');
  const [newState, setNewState] = useState('');
  const [newPlannedCost, setNewPlannedCost] = useState('450');
  const [newDuration, setNewDuration] = useState('36');
  const [newContractor, setNewContractor] = useState('Larsen & Toubro Infrastructure');
  const [newManager, setNewManager] = useState('Er. Anand Verma');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const costNum = parseFloat(newPlannedCost) || 500;
    const durNum = parseInt(newDuration) || 36;
    const id = `proj-${Date.now().toString(36)}`;

    const newProject: Project = {
      id,
      code: newCode.trim().toUpperCase() || `PRJ-${Math.floor(Math.random() * 900 + 100)}`,
      name: newName.trim(),
      location: newLocation.trim() || 'Sector Corridor, India',
      state: newState.trim() || 'Central',
      lat: 20.5937 + (Math.random() - 0.5) * 8,
      lng: 78.9629 + (Math.random() - 0.5) * 8,
      plannedCost: costNum,
      currentExpenditure: Math.round(costNum * 0.15),
      physicalProgress: 18,
      plannedDuration: durNum,
      elapsedDuration: 6,
      status: 'ON TRACK',
      riskScore: 24,
      category: newCategory,
      contractor: newContractor.trim() || 'National EPC Partner',
      manager: newManager.trim() || 'Project Director',
      lastUpdate: 'Just now',
      description: newDescription.trim() || 'National infrastructure priority asset under Master Dev monitoring telemetry.',
      riskBreakdown: {
        overallScore: 24,
        costRisk: 20,
        scheduleRisk: 22,
        progressRisk: 25,
        milestoneRisk: 15,
        riskLevel: 'LOW',
        rootCauses: ['Initial stage ground survey and mobilization complete'],
      },
      evm: {
        pv: Math.round(costNum * (6 / durNum)),
        ev: Math.round(costNum * 0.18),
        ac: Math.round(costNum * 0.15),
        cv: Math.round(costNum * 0.03),
        sv: Math.round(costNum * 0.02),
        cpi: 1.05,
        spi: 1.02,
        eac: costNum,
        vac: 0,
        tcpi: 0.98,
      },
      prediction: {
        predictedCostOverrun: 0,
        predictedTimeOverrun: 0,
        confidenceScore: 0.88,
        modelName: 'XGBoost-Infra-v2.4',
        lastUpdated: 'Just now',
      },
      milestones: [
        {
          id: `m-${id}-1`,
          projectId: id,
          name: 'Land Clearance & Environmental Clearance',
          plannedDate: 'Month 3',
          actualDate: 'Month 3',
          status: 'COMPLETED',
          criticalPath: true,
          delayMonths: 0,
          weightage: 20,
        },
        {
          id: `m-${id}-2`,
          projectId: id,
          name: 'Piling & Foundation Groundwork',
          plannedDate: 'Month 8',
          actualDate: null,
          status: 'IN_PROGRESS',
          criticalPath: true,
          delayMonths: 0,
          weightage: 30,
        },
        {
          id: `m-${id}-3`,
          projectId: id,
          name: 'Structural Superstructure Erection',
          plannedDate: `Month ${Math.round(durNum * 0.6)}`,
          actualDate: null,
          status: 'PENDING',
          criticalPath: true,
          delayMonths: 0,
          weightage: 35,
        },
        {
          id: `m-${id}-4`,
          projectId: id,
          name: 'Commissioning & Safety Certifications',
          plannedDate: `Month ${durNum}`,
          actualDate: null,
          status: 'PENDING',
          criticalPath: true,
          delayMonths: 0,
          weightage: 15,
        },
      ],
      trajectory: [
        {
          monthIndex: 0,
          reportDate: 'Month 0',
          plannedProgress: 0,
          actualProgress: 0,
          plannedExpenditure: 0,
          actualExpenditure: 0,
        },
        {
          monthIndex: 6,
          reportDate: 'Month 6',
          plannedProgress: 16,
          actualProgress: 18,
          plannedExpenditure: Math.round(costNum * 0.16),
          actualExpenditure: Math.round(costNum * 0.15),
        },
      ],
      alerts: [
        {
          id: `alt-${id}-1`,
          projectId: id,
          projectName: newName,
          alertType: 'PROGRESS',
          severity: 'LOW',
          signal: 'Mobilization stage telemetry established',
          impact: 'Telemetry baseline tracking active with 100% sensor feed',
          recommendedAction: 'Continue weekly S-curve monitoring and contractor check-ins',
          detectedAt: 'Today',
          status: 'ACTIVE',
        },
      ],
    };

    await createProject(newProject);
    setIsSubmitting(false);
    setIsCreateModalOpen(false);
    notify('success', 'Project Registered', `${newName} added to Master Dev portfolio and synchronized.`);
    setSelectedProject(newProject);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
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

        {/* Action & View toggle */}
        <div className="flex items-center gap-3">
          <AurumButton
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            icon={<Plus size={15} />}
          >
            REGISTER NEW ASSET
          </AurumButton>

          <div className="inline-flex p-1 rounded-lg bg-obsidian-3 border border-silver/10">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'table' ? 'bg-obsidian-5 text-silver-bright' : 'text-bone-muted hover:text-bone'}`}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-obsidian-5 text-silver-bright' : 'text-bone-muted hover:text-bone'}`}
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
                px-2.5 py-1 rounded-full text-[0.68rem] transition-all
                ${selectedStatus === st ? 'bg-silver-bright text-obsidian-0 font-semibold shadow-sm' : 'bg-obsidian-3 text-bone-muted hover:text-bone'}
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
        <AurumCard variant="showcase" className="p-5 md:p-6 hover-glow-card">
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
              className="p-5 flex flex-col justify-between hover-glow-card cursor-pointer group"
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
                      className="h-full bg-gradient-to-r from-silver-deep to-silver-bright rounded-full progress-fill-animated"
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
              <div className="pt-3 border-t border-silver/10 flex items-center justify-between text-xs font-mono text-silver group-hover:text-silver-bright">
                <span>INSPECT CONTROL PANEL</span>
                <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
              </div>
            </AurumCard>
          ))}
        </div>
      )}

      {/* Register New Asset Modal */}
      <AurumModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="REGISTER NEW INFRASTRUCTURE ASSET"
        maxWidth="xl"
      >

        <form onSubmit={handleCreateProject} className="space-y-4 animate-fade-in">
          <div>
            <label className="mono-label block mb-1">PROJECT NAME / ASSET PACKAGE</label>
            <input
              type="text"
              required
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Mumbai-Ahmedabad High Speed Rail Package C4"
              className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-4 py-2.5 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mono-label block mb-1">PACKAGE CODE</label>
              <input
                type="text"
                required
                value={newCode}
                onChange={e => setNewCode(e.target.value)}
                placeholder="e.g. HSR-PKG-C4"
                className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
              />
            </div>
            <div>
              <label className="mono-label block mb-1">SECTOR CATEGORY</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as Project['category'])}
                className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
              >
                <option value="Highways & Expressways">Highways & Expressways</option>
                <option value="Rail Transit & Metros">Rail Transit & Metros</option>
                <option value="Bridges & Tunnels">Bridges & Tunnels</option>
                <option value="Ports & Maritime">Ports & Maritime</option>
                <option value="Energy Infrastructure">Energy Infrastructure</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mono-label block mb-1">LOCATION CORRIDOR</label>
              <input
                type="text"
                required
                value={newLocation}
                onChange={e => setNewLocation(e.target.value)}
                placeholder="e.g. Surat-Vadodara Section"
                className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
              />
            </div>
            <div>
              <label className="mono-label block mb-1">STATE / REGION</label>
              <input
                type="text"
                required
                value={newState}
                onChange={e => setNewState(e.target.value)}
                placeholder="e.g. Gujarat"
                className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mono-label block mb-1">PLANNED CAPEX (₹ CRORES)</label>
              <input
                type="number"
                required
                min="1"
                value={newPlannedCost}
                onChange={e => setNewPlannedCost(e.target.value)}
                placeholder="e.g. 750"
                className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
              />
            </div>
            <div>
              <label className="mono-label block mb-1">PLANNED DURATION (MONTHS)</label>
              <input
                type="number"
                required
                min="1"
                value={newDuration}
                onChange={e => setNewDuration(e.target.value)}
                placeholder="e.g. 42"
                className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mono-label block mb-1">EPC CONTRACTOR</label>
              <input
                type="text"
                value={newContractor}
                onChange={e => setNewContractor(e.target.value)}
                placeholder="e.g. Larsen & Toubro"
                className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
              />
            </div>
            <div>
              <label className="mono-label block mb-1">RESIDENT ENGINEER / MANAGER</label>
              <input
                type="text"
                value={newManager}
                onChange={e => setNewManager(e.target.value)}
                placeholder="e.g. Er. Anand Verma"
                className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
              />
            </div>
          </div>

          <div>
            <label className="mono-label block mb-1">PROJECT SCOPE & OBJECTIVES</label>
            <textarea
              rows={2}
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              placeholder="Key specifications, corridor alignment, bridge span details, or critical milestones..."
              className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-mono text-bone-muted hover:text-bone"
            >
              CANCEL
            </button>
            <AurumButton
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'INITIALIZING ASSET...' : 'REGISTER & INITIATE TELEMETRY'}
            </AurumButton>
          </div>
        </form>
      </AurumModal>
    </div>
  );
};
