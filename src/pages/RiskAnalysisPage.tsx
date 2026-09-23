import React from 'react';
import { useProjects } from '../context/ProjectContext';
import { ScreenId } from '../components/layout/AurumSidebar';
import { AurumCard } from '../components/common/AurumCard';
import { AurumBadge } from '../components/common/AurumBadge';
import { AurumRiskGauge } from '../components/common/AurumRiskGauge';
import {
  ShieldAlert,
  AlertTriangle,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  TrendingDown,
  Clock,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface RiskAnalysisPageProps {
  onNavigate: (screen: ScreenId) => void;
}

export const RiskAnalysisPage: React.FC<RiskAnalysisPageProps> = ({ onNavigate }) => {
  const { selectedProject, projects, setSelectedProject } = useProjects();
  const p = selectedProject;

  const componentExplanations = {
    schedule: {
      title: 'Schedule Slippage Risk',
      score: p.riskBreakdown.scheduleRisk,
      desc: `Elapsed time is ${p.elapsedDuration} of ${p.plannedDuration} months (${Math.round((p.elapsedDuration / p.plannedDuration) * 100)}%). Forecast models predict a +${p.prediction.predictedTimeOverrun} month critical path delay.`,
      status: p.riskBreakdown.scheduleRisk > 75 ? 'CRITICAL' : 'MONITOR',
    },
    cost: {
      title: 'Cost Overrun Risk',
      score: p.riskBreakdown.costRisk,
      desc: `Capital expenditure of ₹${p.currentExpenditure} Cr against ₹${p.plannedCost} Cr baseline. CPI is ${p.evm.cpi}, projecting an overrun of ₹${p.prediction.predictedCostOverrun} Cr at completion.`,
      status: p.riskBreakdown.costRisk > 75 ? 'CRITICAL' : 'MONITOR',
    },
    progress: {
      title: 'Physical Progress Deficit Risk',
      score: p.riskBreakdown.progressRisk,
      desc: `Current completion is ${p.physicalProgress}%, reflecting a -28% divergence from contractual S-curve targets at Month ${p.elapsedDuration}.`,
      status: p.riskBreakdown.progressRisk > 75 ? 'CRITICAL' : 'MONITOR',
    },
    milestone: {
      title: 'Stage-Gate Milestone Risk',
      score: p.riskBreakdown.milestoneRisk,
      desc: `${p.milestones.filter(m => m.status === 'DELAYED').length} active milestone(s) stalled on critical path, directly delaying downstream contractor packages.`,
      status: p.riskBreakdown.milestoneRisk > 60 ? 'HIGH' : 'STABLE',
    },
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Editorial Header */}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-silver/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="mono-label">PREDICTIVE EARLY-WARNING ENGINE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            <span className="font-mono text-[0.68rem] text-bone-muted">CONFIDENCE {Math.round(p.prediction.confidenceScore * 100)}%</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-bone font-light tracking-tight">
            RISK ANALYSIS & ATTRIBUTION
          </h1>
          <p className="text-bone-muted text-xs md:text-sm mt-1">
            Decomposed risk scoring and evidence-grounded root causes for {p.name}.
          </p>
        </div>

        {/* Action quick links */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('copilot')}
            className="btn-aurum-primary text-xs"
          >
            <Sparkles size={14} />
            <span>AI ROOT CAUSE BRIEF</span>
          </button>
          <button
            onClick={() => onNavigate('simulation')}
            className="btn-aurum-secondary text-xs"
          >
            <SlidersHorizontal size={14} />
            <span>SIMULATE MITIGATION</span>
          </button>
        </div>
      </div>

      {/* Primary Score Showcase Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Master Score Dial (5 cols) */}
        <AurumCard variant="showcase" className="lg:col-span-5 p-6 flex flex-col items-center justify-center text-center">
          <span className="mono-label block mb-2">COMPOSITE RISK INDEX</span>
          <AurumRiskGauge
            score={p.riskScore}
            breakdown={p.riskBreakdown}
            showDetails={false}
          />

          <div className="mt-6 pt-4 border-t border-silver/10 w-full flex items-center justify-around font-mono text-xs">
            <div>
              <span className="text-bone-muted text-[0.65rem] block">CLASSIFICATION</span>
              <span className="text-bone font-bold">{p.status}</span>
            </div>
            <div className="border-l border-silver/10 pl-4">
              <span className="text-bone-muted text-[0.65rem] block">EVALUATED AT</span>
              <span className="text-silver-bright font-medium">{p.lastUpdate.split(' ')[0]}</span>
            </div>
          </div>
        </AurumCard>

        {/* Component Risk Decomposition Bars (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <AurumCard variant="showcase" className="p-6 space-y-5">
            <div className="border-b border-silver/10 pb-3">
              <span className="mono-label">COMPONENT RISK DECOMPOSITION</span>
              <h3 className="font-display text-lg text-bone">Risk Vector Scoring</h3>
            </div>

            {/* Schedule Risk */}
            <div className="p-3.5 rounded-xl bg-obsidian-3/80 border border-silver/10 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-bone font-medium">{componentExplanations.schedule.title}</span>
                <span className="text-red-300 font-bold text-sm">{componentExplanations.schedule.score} / 100</span>
              </div>
              <div className="w-full h-1.5 bg-obsidian-4 rounded-full overflow-hidden">
                <div className="h-full bg-red-400 rounded-full" style={{ width: `${componentExplanations.schedule.score}%` }} />
              </div>
              <p className="text-[0.75rem] text-bone-muted font-sans pt-1">
                {componentExplanations.schedule.desc}
              </p>
            </div>

            {/* Cost Risk */}
            <div className="p-3.5 rounded-xl bg-obsidian-3/80 border border-silver/10 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-bone font-medium">{componentExplanations.cost.title}</span>
                <span className="text-orange-300 font-bold text-sm">{componentExplanations.cost.score} / 100</span>
              </div>
              <div className="w-full h-1.5 bg-obsidian-4 rounded-full overflow-hidden">
                <div className="h-full bg-orange-400 rounded-full" style={{ width: `${componentExplanations.cost.score}%` }} />
              </div>
              <p className="text-[0.75rem] text-bone-muted font-sans pt-1">
                {componentExplanations.cost.desc}
              </p>
            </div>

            {/* Progress Risk */}
            <div className="p-3.5 rounded-xl bg-obsidian-3/80 border border-silver/10 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-bone font-medium">{componentExplanations.progress.title}</span>
                <span className="text-orange-300 font-bold text-sm">{componentExplanations.progress.score} / 100</span>
              </div>
              <div className="w-full h-1.5 bg-obsidian-4 rounded-full overflow-hidden">
                <div className="h-full bg-orange-400 rounded-full" style={{ width: `${componentExplanations.progress.score}%` }} />
              </div>
              <p className="text-[0.75rem] text-bone-muted font-sans pt-1">
                {componentExplanations.progress.desc}
              </p>
            </div>

            {/* Milestone Risk */}
            <div className="p-3.5 rounded-xl bg-obsidian-3/80 border border-silver/10 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-bone font-medium">{componentExplanations.milestone.title}</span>
                <span className="text-amber-300 font-bold text-sm">{componentExplanations.milestone.score} / 100</span>
              </div>
              <div className="w-full h-1.5 bg-obsidian-4 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${componentExplanations.milestone.score}%` }} />
              </div>
              <p className="text-[0.75rem] text-bone-muted font-sans pt-1">
                {componentExplanations.milestone.desc}
              </p>
            </div>
          </AurumCard>
        </div>
      </div>

      {/* EVIDENCE SECTION: WHY IS THIS PROJECT AT RISK? */}
      <AurumCard variant="showcase" className="p-6 md:p-8 border-silver/25">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={18} className="text-amber-400" />
          <span className="mono-label text-amber-300">GROUNDED ATTRIBUTION AUDIT</span>
        </div>
        <h2 className="font-display text-2xl md:text-3xl text-bone font-light mb-4">
          Why is {p.name} at risk?
        </h2>
        <p className="text-xs md:text-sm text-bone-muted font-sans mb-6 max-w-3xl">
          The early-warning risk engine synthesizes project telemetry against historical infrastructure delivery baselines. The following evidence points substantiate the current risk score of {p.riskScore}/100:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {p.riskBreakdown.rootCauses.map((cause, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-obsidian-3/80 border border-silver/10 flex items-start gap-3"
            >
              <span className="w-6 h-6 rounded-full bg-gradient-to-br from-silver to-steel text-obsidian-0 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-xs text-bone-2 leading-relaxed font-sans">
                {cause}
              </p>
            </div>
          ))}
        </div>

        {/* Recommended Intervention Callout */}
        <div className="mt-6 p-4 rounded-xl bg-obsidian-1 border border-silver/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="mono-label text-emerald-300 block mb-1">
              RECOMMENDED RISK MITIGATION
            </span>
            <p className="text-xs text-bone-2 font-sans">
              Mobilize second batching plant, expedite pier geotechnical approvals, and fast-track bridge superstructure segments to recover 3 months of schedule float.
            </p>
          </div>
          <button
            onClick={() => onNavigate('simulation')}
            className="btn-aurum-primary text-xs shrink-0 whitespace-nowrap"
          >
            <span>TEST IN SIMULATOR</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </AurumCard>
    </div>
  );
};
