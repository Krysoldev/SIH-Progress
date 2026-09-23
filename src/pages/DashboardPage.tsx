import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { Project } from '../types/project';
import { ScreenId } from '../components/layout/AurumSidebar';
import { AurumMetric } from '../components/common/AurumMetric';
import { AurumCard } from '../components/common/AurumCard';
import { AurumBadge } from '../components/common/AurumBadge';
import { ActiveProjectsTable } from '../components/project/ActiveProjectsTable';
import { ProjectSCurveChart } from '../components/project/ProjectSCurveChart';
import {
  TrendingUp,
  AlertTriangle,
  FolderGit2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

interface DashboardPageProps {
  onNavigate: (screen: ScreenId) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { projects, selectedProject, setSelectedProject, summary, searchQuery } = useProjects();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredProjects = projects.filter(p => {
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    onNavigate('details');
  };

  // Risk distribution data for portfolio bar chart
  const riskDistributionData = [
    { name: 'Low (<40)', count: projects.filter(p => p.riskScore < 40).length, color: '#34d399' },
    { name: 'Watch (40-64)', count: projects.filter(p => p.riskScore >= 40 && p.riskScore < 65).length, color: '#facc15' },
    { name: 'At Risk (65-79)', count: projects.filter(p => p.riskScore >= 65 && p.riskScore < 80).length, color: '#fb923c' },
    { name: 'Critical (≥80)', count: projects.filter(p => p.riskScore >= 80).length, color: '#f87171' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Editorial Title & Context Header */}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-silver/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="mono-label">EARLY WARNING RADAR</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-[0.68rem] text-bone-muted">LIVE TELEMETRY</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light text-bone tracking-tight">
            PROJECT OVERVIEW
          </h1>
          <p className="text-bone-muted text-sm sm:text-base font-sans mt-1 max-w-2xl">
            Portfolio intelligence and early-warning signals across critical infrastructure assets.
          </p>
        </div>

        {/* Action quick links */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('copilot')}
            className="btn-aurum-primary text-xs"
          >
            <Sparkles size={14} />
            <span>ASK COPILOT</span>
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="btn-aurum-secondary text-xs"
          >
            <span>EXECUTIVE BRIEF</span>
          </button>
        </div>
      </div>

      {/* Top KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <AurumMetric
          label="TOTAL PORTFOLIO ASSETS"
          value={summary.totalProjects}
          subValue={`₹${summary.totalPlannedCost} Cr Committed`}
          delta={{ value: '6 Live Packages', isNeutral: true }}
          icon={<FolderGit2 size={16} />}
        />

        {/* KPI 2 */}
        <AurumMetric
          label="PROJECTS AT RISK"
          value={summary.projectsAtRisk + summary.projectsCritical}
          subValue={`${summary.projectsCritical} Critical Attention`}
          delta={{ value: '+1 Escalated this week', isPositive: false }}
          indicator="alert"
          icon={<ShieldAlert size={16} className="text-orange-400" />}
        />

        {/* KPI 3 */}
        <AurumMetric
          label="PORTFOLIO EXPENDITURE"
          value={`₹${summary.totalCurrentExpenditure}`}
          subValue={`of ₹${summary.totalPlannedCost} Cr total`}
          delta={{ value: '64.8% Capital Deployed', isNeutral: true }}
          icon={<TrendingUp size={16} />}
        />

        {/* KPI 4 */}
        <AurumMetric
          label="SCHEDULE DEVIATION"
          value={`+${summary.averageScheduleDelay}m`}
          subValue="Avg. Slippage"
          delta={{ value: 'High risk in 2 assets', isPositive: false }}
          indicator="warning"
          icon={<Calendar size={16} />}
        />
      </div>

      {/* Secondary KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-2xl bg-obsidian-2/60 border border-silver/10 text-xs font-mono">
        <div className="flex items-center justify-between p-2">
          <span className="text-bone-muted text-[0.68rem]">WEIGHTED PROGRESS</span>
          <span className="text-bone font-bold text-sm">{summary.averageProgress}%</span>
        </div>
        <div className="flex items-center justify-between p-2 border-l border-silver/10">
          <span className="text-bone-muted text-[0.68rem]">PROJECTED COST OVERRUN</span>
          <span className="text-red-300 font-bold text-sm">₹{summary.forecastCostOverrun} Cr</span>
        </div>
        <div className="flex items-center justify-between p-2 border-l border-silver/10">
          <span className="text-bone-muted text-[0.68rem]">ACTIVE SIGNALS</span>
          <span className="text-amber-300 font-bold text-sm">{summary.activeAlertsCount} Alerts</span>
        </div>
        <div className="flex items-center justify-between p-2 border-l border-silver/10">
          <span className="text-bone-muted text-[0.68rem]">AI REASONING</span>
          <span className="text-emerald-300 font-bold text-sm">XGBoost v2.4</span>
        </div>
      </div>

      {/* Flagship Scenario Callout: Highway Expansion */}
      {selectedProject && selectedProject.status === 'AT RISK' && (
        <div className="p-5 md:p-6 rounded-showcase bg-gradient-to-r from-obsidian-2 via-obsidian-3 to-obsidian-2 border border-orange-500/30 shadow-deep relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full filter blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <AurumBadge status="AT RISK" pulse />
                <span className="font-mono text-xs text-bone-muted">{selectedProject.code}</span>
                <span className="text-silver-dark font-mono text-xs">•</span>
                <span className="font-mono text-xs text-red-300 font-semibold">
                  Risk Score: {selectedProject.riskScore}/100
                </span>
              </div>
              <h2 className="font-display text-xl md:text-2xl text-bone font-medium">
                {selectedProject.name} — Critical Schedule & Cost Divergence
              </h2>
              <p className="text-xs text-bone-muted font-sans leading-relaxed">
                Physical progress is at <strong>55%</strong> while <strong>30 of 36 months</strong> have elapsed. Current expenditure has reached <strong>₹340 Cr</strong> with an estimated cost overrun of <strong>₹85.5 Cr</strong>. Major Bridge Pier Foundation milestone is delayed by 4 months.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => onNavigate('details')}
                className="btn-aurum-primary text-xs"
              >
                <span>INSPECT PROJECT DETAILS</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* S-Curve Chart (8 cols) */}
        <div className="lg:col-span-8">
          <ProjectSCurveChart
            trajectory={selectedProject.trajectory}
            projectName={selectedProject.name}
          />
        </div>

        {/* Portfolio Risk Distribution Radar/Bar (4 cols) */}
        <div className="lg:col-span-4">
          <AurumCard variant="showcase" className="p-5 md:p-6 h-full flex flex-col justify-between">
            <div>
              <div className="border-b border-silver/10 pb-3 mb-4">
                <span className="mono-label">PORTFOLIO EXPOSURE</span>
                <h3 className="font-display text-lg text-bone">Risk Score Distribution</h3>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      stroke="#5e6675"
                      tick={{ fill: '#8a94a4', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    />
                    <YAxis
                      stroke="#5e6675"
                      tick={{ fill: '#8a94a4', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-obsidian-2 border border-silver/20 rounded-lg p-2 text-xs font-mono text-bone">
                              <p className="font-semibold">{payload[0].payload.name}</p>
                              <p className="text-silver-bright">{payload[0].value} Project(s)</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {riskDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 mt-4 pt-3 border-t border-silver/10 text-xs font-mono">
                <div className="flex justify-between items-center text-bone-muted">
                  <span>AT RISK & CRITICAL RATIO</span>
                  <span className="text-red-300 font-bold">
                    {Math.round(((summary.projectsAtRisk + summary.projectsCritical) / summary.totalProjects) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-bone-muted">
                  <span>CAPITAL UNDER HIGH RISK</span>
                  <span className="text-bone font-medium">₹1,560 Cr</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('risk')}
              className="w-full mt-4 py-2 px-3 rounded-xl bg-obsidian-3 hover:bg-obsidian-4 border border-silver/15 text-xs font-mono text-silver-bright flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>OPEN DEEP RISK ANALYSIS</span>
              <ArrowRight size={13} />
            </button>
          </AurumCard>
        </div>
      </div>

      {/* Active Projects Section */}
      <AurumCard variant="showcase" className="p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-silver/10">
          <div>
            <span className="mono-label">INFRASTRUCTURE ASSET DIRECTORY</span>
            <h3 className="font-display text-xl text-bone">Active Projects Portfolio</h3>
          </div>

          {/* Quick status filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['ALL', 'CRITICAL', 'AT RISK', 'WATCH', 'ON TRACK'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`
                  px-3 py-1 text-xs font-mono rounded-full transition-all whitespace-nowrap
                  ${
                    filterStatus === status
                      ? 'bg-silver-bright text-obsidian-0 font-semibold'
                      : 'bg-obsidian-3 text-bone-muted hover:text-bone border border-silver/10'
                  }
                `}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table component */}
        <ActiveProjectsTable
          projects={filteredProjects}
          onSelectProject={handleSelectProject}
          selectedProjectId={selectedProject?.id}
        />
      </AurumCard>
    </div>
  );
};
