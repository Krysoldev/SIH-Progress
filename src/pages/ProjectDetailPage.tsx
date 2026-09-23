import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { useNotification } from '../context/NotificationContext';
import { ScreenId } from '../components/layout/AurumSidebar';
import { AurumCard } from '../components/common/AurumCard';
import { AurumMetric } from '../components/common/AurumMetric';
import { AurumBadge } from '../components/common/AurumBadge';
import { AurumModal } from '../components/common/AurumModal';
import { AurumButton } from '../components/common/AurumButton';
import { AurumRiskGauge } from '../components/common/AurumRiskGauge';
import { ProjectSCurveChart } from '../components/project/ProjectSCurveChart';
import { MilestoneTracker } from '../components/project/MilestoneTracker';
import { EVMMetricsPanel } from '../components/project/EVMMetricsPanel';
import { MilestoneStatus, ProjectStatus } from '../types/project';
import {
  Sparkles,
  SlidersHorizontal,
  FileText,
  MapPin,
  AlertTriangle,
  ArrowRight,
  Building,
  UserCheck,
  Edit3,
  CheckCircle,
  Save,
} from 'lucide-react';

interface ProjectDetailPageProps {
  onNavigate: (screen: ScreenId) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ onNavigate }) => {
  const { selectedProject, updateMilestone, updateProject } = useProjects();
  const { notify } = useNotification();
  const p = selectedProject;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProgress, setEditProgress] = useState(p?.physicalProgress?.toString() || '50');
  const [editExpenditure, setEditExpenditure] = useState(p?.currentExpenditure?.toString() || '300');
  const [editStatus, setEditStatus] = useState<ProjectStatus>(p?.status || 'ON TRACK');
  const [editContractor, setEditContractor] = useState(p?.contractor || '');
  const [editManager, setEditManager] = useState(p?.manager || '');

  // Keep edit state synced with current project
  React.useEffect(() => {
    if (p) {
      setEditProgress(p.physicalProgress.toString());
      setEditExpenditure(p.currentExpenditure.toString());
      setEditStatus(p.status);
      setEditContractor(p.contractor);
      setEditManager(p.manager);
    }
  }, [p]);

  if (!p || !p.id) {
    return (
      <div className="p-12 text-center text-bone-muted font-mono">
        LOADING PROJECT INTELLIGENCE...
      </div>
    );
  }

  const handleMilestoneUpdate = async (msId: string, st: MilestoneStatus) => {
    await updateMilestone(p.id, msId, st);
    notify('success', 'Milestone Updated', `Status changed to ${st}. Composite risk score and EVM recalculated.`);
  };

  const handleSaveProjectEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    const progressNum = Math.min(100, Math.max(0, parseFloat(editProgress) || p.physicalProgress));
    const expNum = Math.max(0, parseFloat(editExpenditure) || p.currentExpenditure);

    const ev = Math.round(p.plannedCost * (progressNum / 100));
    const cpi = parseFloat((ev / (expNum || 1)).toFixed(2));
    const pv = p.evm.pv || Math.round(p.plannedCost * 0.5);
    const spi = parseFloat((ev / (pv || 1)).toFixed(2));

    const updated = {
      ...p,
      physicalProgress: progressNum,
      currentExpenditure: expNum,
      status: editStatus,
      contractor: editContractor.trim() || p.contractor,
      manager: editManager.trim() || p.manager,
      evm: {
        ...p.evm,
        ev,
        ac: expNum,
        cv: Math.round(ev - expNum),
        cpi,
        spi,
      },
    };

    await updateProject(updated);
    setIsEditModalOpen(false);
    notify('success', 'Project Telemetry Saved', `Updated physical completion to ${progressNum}% and expenditure to ₹${expNum} Cr.`);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Executive Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-silver/10 pb-6">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-silver-bright font-semibold">{p.code}</span>
            <span className="text-silver-dark">•</span>
            <span className="font-mono text-xs text-bone-muted">{p.category}</span>
            <span className="text-silver-dark">•</span>
            <AurumBadge status={p.status} pulse={p.status === 'AT RISK' || p.status === 'CRITICAL'} />
          </div>

          <h1 className="font-display text-3xl sm:text-4xl text-bone font-light tracking-tight">
            {p.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-bone-muted pt-1">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-silver-bright" />
              <span>{p.location}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Building size={13} />
              <span>{p.contractor}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <UserCheck size={13} />
              <span>{p.manager}</span>
            </span>
          </div>

          <p className="text-xs text-bone-muted leading-relaxed pt-2 font-sans">
            {p.description}
          </p>
        </div>

        {/* Action bar: Jump directly to AI Copilot, Simulation, Edit Modal, Reports */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="btn-aurum-secondary text-xs"
            title="Edit actual progress, budget, or contractor details"
          >
            <Edit3 size={14} />
            <span>EDIT ASSET</span>
          </button>
          <button
            onClick={() => onNavigate('copilot')}
            className="btn-aurum-primary text-xs"
          >
            <Sparkles size={14} />
            <span>ASK COPILOT</span>
          </button>
          <button
            onClick={() => onNavigate('simulation')}
            className="btn-aurum-secondary text-xs"
          >
            <SlidersHorizontal size={14} />
            <span>WHAT-IF SIMULATION</span>
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="btn-aurum-secondary text-xs"
          >
            <FileText size={14} />
            <span>GENERATE REPORT</span>
          </button>
        </div>
      </div>

      {/* Top 5 Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        {/* Metric 1: Planned Cost */}
        <AurumMetric
          label="PLANNED BUDGET (BAC)"
          value={`₹${p.plannedCost}`}
          subValue="Cr"
          delta={{ value: `Cap: ₹${p.plannedCost} Cr`, isNeutral: true }}
        />

        {/* Metric 2: Current Expenditure */}
        <AurumMetric
          label="ACTUAL EXPENDITURE"
          value={`₹${p.currentExpenditure}`}
          subValue="Cr"
          delta={{
            value: `CPI ${p.evm.cpi} (${Math.round((p.currentExpenditure / p.plannedCost) * 100)}% spent)`,
            isPositive: p.evm.cpi >= 1,
          }}
          indicator={p.evm.cpi < 0.85 ? 'alert' : 'silver'}
        />

        {/* Metric 3: Physical Progress */}
        <AurumMetric
          label="PHYSICAL PROGRESS"
          value={`${p.physicalProgress}%`}
          delta={{
            value: `SPI ${p.evm.spi} (Target: ~${Math.round((p.elapsedDuration / p.plannedDuration) * 100)}%)`,
            isPositive: p.physicalProgress >= Math.round((p.elapsedDuration / p.plannedDuration) * 100),
          }}
          indicator={p.physicalProgress < 60 ? 'warning' : 'silver'}
        />

        {/* Metric 4: Time Elapsed */}
        <AurumMetric
          label="DURATION ELAPSED"
          value={`${p.elapsedDuration}`}
          subValue={`/ ${p.plannedDuration} mos`}
          delta={{
            value: `Forecast: +${p.prediction.predictedTimeOverrun} mos delay`,
            isPositive: p.prediction.predictedTimeOverrun === 0,
          }}
          indicator={p.prediction.predictedTimeOverrun > 2 ? 'alert' : 'silver'}
        />

        {/* Metric 5: Master Risk Score */}
        <AurumCard variant="compact" className="p-4 md:p-5 flex flex-col justify-between col-span-2 md:col-span-1 hover-glow-card">
          <div className="flex justify-between items-center mb-1">
            <span className="mono-label">COMPOSITE RISK</span>
            <AurumBadge status={p.riskBreakdown.riskLevel} size="sm" />
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="font-display text-3xl font-light text-bone">
              {p.riskScore}
            </span>
            <span className="font-mono text-xs text-bone-muted">/ 100</span>
          </div>
          <p className="font-mono text-[0.65rem] text-bone-muted truncate">
            Confidence: {Math.round(p.prediction.confidenceScore * 100)}%
          </p>
        </AurumCard>
      </div>

      {/* Main Analysis Grid: S-Curve on left, Risk Gauge & Root Causes on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: S-Curve & EVM Panel (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <ProjectSCurveChart
            trajectory={p.trajectory}
            title="PHYSICAL & FINANCIAL S-CURVES"
            projectName={p.name}
          />

          <EVMMetricsPanel
            evm={p.evm}
            plannedCost={p.plannedCost}
          />
        </div>

        {/* Right Column: Risk Gauge & Root Causes (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Risk Gauge Card */}
          <AurumCard variant="showcase" className="p-6 hover-glow-card">
            <span className="mono-label block text-center mb-2">RISK ENGINE AUDIT</span>
            <AurumRiskGauge
              score={p.riskScore}
              breakdown={p.riskBreakdown}
            />

            <button
              onClick={() => onNavigate('risk')}
              className="w-full mt-5 py-2 px-3 rounded-xl bg-obsidian-3 hover:bg-obsidian-4 border border-silver/15 text-xs font-mono text-silver-bright flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>EXPLORE RISK DECOMPOSITION</span>
              <ArrowRight size={13} />
            </button>
          </AurumCard>

          {/* Root Causes Evidence Card */}
          <AurumCard variant="showcase" className="p-6 hover-glow-card">
            <span className="mono-label block mb-2 flex items-center gap-1.5 text-amber-300">
              <AlertTriangle size={13} />
              WHY IS THIS PROJECT AT RISK?
            </span>
            <h4 className="font-display text-base text-bone mb-3">Key Risk Evidence</h4>

            <ul className="space-y-2.5 text-xs text-bone-muted font-sans pl-1">
              {p.riskBreakdown.rootCauses.map((cause, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-silver-bright font-bold shrink-0 mt-0.5">•</span>
                  <span className="text-bone-2 leading-relaxed">{cause}</span>
                </li>
              ))}
            </ul>
          </AurumCard>
        </div>
      </div>

      {/* Milestone Tracking & Early Warning Signals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Milestone Tracker (7 cols) */}
        <div className="lg:col-span-7">
          <MilestoneTracker
            milestones={p.milestones}
            onUpdateStatus={handleMilestoneUpdate}
          />
        </div>

        {/* Early Warnings Detected on This Project (5 cols) */}
        <div className="lg:col-span-5">
          <AurumCard variant="showcase" className="p-6 h-full flex flex-col justify-between hover-glow-card">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-silver/10 mb-4">
                <div>
                  <span className="mono-label">EARLY WARNING RADAR</span>
                  <h3 className="font-display text-lg text-bone">Active Signals ({p.alerts.length})</h3>
                </div>
                <button
                  onClick={() => onNavigate('alerts')}
                  className="font-mono text-xs text-silver hover:underline"
                >
                  View All Signals
                </button>
              </div>

              <div className="space-y-3">
                {p.alerts.map(alt => (
                  <div
                    key={alt.id}
                    className="p-3.5 rounded-xl bg-obsidian-3/90 border border-silver/15 space-y-2 text-xs hover:border-silver/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AurumBadge status={alt.alertType} size="sm" />
                        <AurumBadge status={alt.severity} size="sm" pulse={alt.severity === 'CRITICAL'} />
                      </div>
                      <span className="font-mono text-[0.65rem] text-bone-faint">{alt.detectedAt}</span>
                    </div>

                    <p className="text-bone font-medium text-[0.78rem]">
                      {alt.signal}
                    </p>

                    <div className="pt-2 border-t border-silver/10 space-y-1 text-[0.72rem]">
                      <p className="text-bone-muted">
                        <strong className="text-silver-bright font-normal">Impact:</strong> {alt.impact}
                      </p>
                      <p className="text-amber-200">
                        <strong className="text-silver-bright font-normal">Next Step:</strong> {alt.recommendedAction}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onNavigate('copilot')}
              className="w-full mt-4 py-2 px-3 rounded-xl bg-obsidian-4 hover:bg-obsidian-5 border border-silver/20 text-xs font-mono text-silver-bright flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles size={13} />
              <span>INVESTIGATE WITH AI COPILOT</span>
            </button>
          </AurumCard>
        </div>
      </div>

      {/* Edit Project Modal */}
      <AurumModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`EDIT TELEMETRY — ${p.code}`}
        maxWidth="lg"
      >

        <form onSubmit={handleSaveProjectEdits} className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mono-label block mb-1">PHYSICAL PROGRESS (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                required
                value={editProgress}
                onChange={e => setEditProgress(e.target.value)}
                className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
              />
            </div>
            <div>
              <label className="mono-label block mb-1">ACTUAL EXPENDITURE (₹ CR)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                required
                value={editExpenditure}
                onChange={e => setEditExpenditure(e.target.value)}
                className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
              />
            </div>
          </div>

          <div>
            <label className="mono-label block mb-1">HEALTH CLASSIFICATION</label>
            <select
              value={editStatus}
              onChange={e => setEditStatus(e.target.value as ProjectStatus)}
              className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
            >
              <option value="ON TRACK">ON TRACK (Within Parameters)</option>
              <option value="WATCH">WATCH (Variance Emerging)</option>
              <option value="AT RISK">AT RISK (Major Overrun Imminent)</option>
              <option value="CRITICAL">CRITICAL (Critical Path Blocked)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mono-label block mb-1">CONTRACTOR</label>
              <input
                type="text"
                value={editContractor}
                onChange={e => setEditContractor(e.target.value)}
                className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
              />
            </div>
            <div>
              <label className="mono-label block mb-1">RESIDENT ENGINEER</label>
              <input
                type="text"
                value={editManager}
                onChange={e => setEditManager(e.target.value)}
                className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-mono text-bone-muted hover:text-bone"
            >
              CANCEL
            </button>
            <AurumButton type="submit" variant="primary" size="md" icon={<Save size={14} />}>
              SAVE REVISED METRICS
            </AurumButton>
          </div>
        </form>
      </AurumModal>
    </div>
  );
};
