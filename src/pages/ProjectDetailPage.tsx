import React from 'react';
import { useProjects } from '../context/ProjectContext';
import { ScreenId } from '../components/layout/AurumSidebar';
import { AurumCard } from '../components/common/AurumCard';
import { AurumMetric } from '../components/common/AurumMetric';
import { AurumBadge } from '../components/common/AurumBadge';
import { AurumRiskGauge } from '../components/common/AurumRiskGauge';
import { ProjectSCurveChart } from '../components/project/ProjectSCurveChart';
import { MilestoneTracker } from '../components/project/MilestoneTracker';
import { EVMMetricsPanel } from '../components/project/EVMMetricsPanel';
import {
  Sparkles,
  SlidersHorizontal,
  FileText,
  MapPin,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Building,
  UserCheck,
} from 'lucide-react';

interface ProjectDetailPageProps {
  onNavigate: (screen: ScreenId) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ onNavigate }) => {
  const { selectedProject, updateMilestone } = useProjects();
  const p = selectedProject;

  if (!p || !p.id) {
    return (
      <div className="p-12 text-center text-bone-muted font-mono">
        LOADING PROJECT INTELLIGENCE...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
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

        {/* Action bar: Jump directly to AI Copilot, Simulation, Map, Reports */}
        <div className="flex flex-wrap items-center gap-2.5">
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
        <AurumCard variant="compact" className="p-4 md:p-5 flex flex-col justify-between col-span-2 md:col-span-1">
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
          <AurumCard variant="showcase" className="p-6">
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
          <AurumCard variant="showcase" className="p-6">
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
            onUpdateStatus={(msId, st) => updateMilestone(p.id, msId, st)}
          />
        </div>

        {/* Early Warnings Detected on This Project (5 cols) */}
        <div className="lg:col-span-5">
          <AurumCard variant="showcase" className="p-6 h-full flex flex-col justify-between">
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
                    className="p-3.5 rounded-xl bg-obsidian-3/90 border border-silver/15 space-y-2 text-xs"
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
    </div>
  );
};
