import React, { useState } from 'react';
import { Project } from '../../types/project';
import { SimulationEngine, SimulationParameters, SimulationOutcome } from '../../services/simulationEngine';
import { useNotification } from '../../context/NotificationContext';
import { useProjects } from '../../context/ProjectContext';
import { AurumCard } from '../common/AurumCard';
import { AurumBadge } from '../common/AurumBadge';
import { AurumButton } from '../common/AurumButton';
import { RotateCcw, Zap, TrendingUp, AlertTriangle, BookmarkCheck, SlidersHorizontal } from 'lucide-react';

interface SimulationSlidersProps {
  project: Project;
}

export const SimulationSliders: React.FC<SimulationSlidersProps> = ({ project }) => {
  const { notify } = useNotification();
  const { updateProject } = useProjects();

  const [params, setParams] = useState<SimulationParameters>({
    progressRateAdjustment: 0,
    expenditureRateAdjustment: 0,
    scheduleRecoveryBuffer: 0,
    materialInflationFactor: 0,
  });

  const outcome: SimulationOutcome = SimulationEngine.runSimulation(project, params);

  const applyPreset = (preset: 'acceleration' | 'inflation' | 'stabilization' | 'reset') => {
    switch (preset) {
      case 'acceleration':
        setParams({
          progressRateAdjustment: 18,
          expenditureRateAdjustment: 12,
          scheduleRecoveryBuffer: 3,
          materialInflationFactor: 0,
        });
        notify('info', 'Fast-Track Preset Applied', 'Accelerating physical velocity by +18% with +3 month compression.');
        break;
      case 'inflation':
        setParams({
          progressRateAdjustment: -10,
          expenditureRateAdjustment: 25,
          scheduleRecoveryBuffer: 0,
          materialInflationFactor: 12,
        });
        notify('warning', 'Inflation Shock Preset Applied', 'Simulating +12% commodity price escalation and +25% burn.');
        break;
      case 'stabilization':
        setParams({
          progressRateAdjustment: 8,
          expenditureRateAdjustment: -15,
          scheduleRecoveryBuffer: 1.5,
          materialInflationFactor: 2,
        });
        notify('info', 'Conservative Recovery Applied', 'Balancing capital preservation with steady critical path progress.');
        break;
      case 'reset':
      default:
        setParams({
          progressRateAdjustment: 0,
          expenditureRateAdjustment: 0,
          scheduleRecoveryBuffer: 0,
          materialInflationFactor: 0,
        });
        notify('info', 'Baseline Restored', 'Model assumptions reset to project baseline.');
        break;
    }
  };

  const handleApplyToProject = async () => {
    const updated: Project = {
      ...project,
      riskScore: outcome.simulatedRiskScore,
      riskBreakdown: {
        ...project.riskBreakdown,
        overallScore: outcome.simulatedRiskScore,
        riskLevel: outcome.newRiskLevel,
      },
      evm: {
        ...project.evm,
        cpi: outcome.simulatedCpi,
        spi: outcome.simulatedSpi,
        eac: Math.round(outcome.simulatedCost),
      },
      prediction: {
        ...project.prediction,
        predictedCostOverrun: Math.max(0, Math.round(outcome.simulatedCost - project.plannedCost)),
        predictedTimeOverrun: Math.max(0, Math.round(project.prediction.predictedTimeOverrun + outcome.scheduleDeltaMonths)),
      },
    };

    await updateProject(updated);
    notify('success', 'Scenario Applied as Target Baseline', `Updated project EAC to ₹${outcome.simulatedCost.toFixed(1)} Cr and risk score to ${outcome.simulatedRiskScore}/100.`);
  };

  return (
    <div className="space-y-6">
      {/* Preset Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-obsidian-2 border border-silver/10 hover-glow-card">
        <div>
          <span className="mono-label">WHAT-IF SCENARIO SIMULATOR</span>
          <h3 className="font-display text-base text-bone mt-0.5">
            Scenario Modeling for {project.name}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applyPreset('acceleration')}
            className="px-3 py-1.5 rounded-full bg-obsidian-3 hover:bg-obsidian-4 border border-silver/15 text-xs font-mono text-silver-bright flex items-center gap-1.5 transition-all hover:-translate-y-0.5"
          >
            <Zap size={13} className="text-amber-300" />
            <span>Fast-Track Compression</span>
          </button>
          <button
            onClick={() => applyPreset('inflation')}
            className="px-3 py-1.5 rounded-full bg-obsidian-3 hover:bg-obsidian-4 border border-silver/15 text-xs font-mono text-bone-muted hover:text-bone flex items-center gap-1.5 transition-all hover:-translate-y-0.5"
          >
            <TrendingUp size={13} className="text-red-300" />
            <span>Commodity Inflation Shock</span>
          </button>
          <button
            onClick={() => applyPreset('stabilization')}
            className="px-3 py-1.5 rounded-full bg-obsidian-3 hover:bg-obsidian-4 border border-silver/15 text-xs font-mono text-bone-muted hover:text-bone flex items-center gap-1.5 transition-all hover:-translate-y-0.5"
          >
            <span>Conservative Recovery</span>
          </button>
          <button
            onClick={() => applyPreset('reset')}
            className="px-3 py-1.5 rounded-full bg-obsidian-4 hover:bg-obsidian-5 border border-silver/20 text-xs font-mono text-bone-muted hover:text-bone flex items-center gap-1 transition-all"
            title="Reset parameters to current baseline"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Controls on Left, Dynamic Outcome on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <AurumCard variant="showcase" className="lg:col-span-6 p-6 space-y-6 hover-glow-card">
          <div className="border-b border-silver/10 pb-3">
            <span className="mono-label">MODEL PARAMETERS</span>
            <h4 className="font-display text-lg text-bone">Intervention Assumptions</h4>
          </div>

          {/* Slider 1: Physical Progress Rate */}
          <div>
            <div className="flex justify-between items-center mb-1.5 font-mono text-xs">
              <span className="text-bone-2">Progress Rate Adjustment</span>
              <span className={`font-bold ${params.progressRateAdjustment >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                {params.progressRateAdjustment >= 0 ? `+${params.progressRateAdjustment}%` : `${params.progressRateAdjustment}%`}
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="30"
              step="1"
              value={params.progressRateAdjustment}
              onChange={e => setParams({ ...params, progressRateAdjustment: Number(e.target.value) })}
              className="w-full accent-silver-bright bg-obsidian-4 cursor-pointer"
            />
            <div className="flex justify-between text-[0.62rem] font-mono text-bone-faint mt-1">
              <span>-20% Slowdown</span>
              <span>Baseline (0%)</span>
              <span>+30% Acceleration</span>
            </div>
          </div>

          {/* Slider 2: Monthly Expenditure Burn */}
          <div>
            <div className="flex justify-between items-center mb-1.5 font-mono text-xs">
              <span className="text-bone-2">Monthly Expenditure Velocity</span>
              <span className={`font-bold ${params.expenditureRateAdjustment <= 0 ? 'text-emerald-300' : 'text-amber-300'}`}>
                {params.expenditureRateAdjustment >= 0 ? `+${params.expenditureRateAdjustment}%` : `${params.expenditureRateAdjustment}%`}
              </span>
            </div>
            <input
              type="range"
              min="-25"
              max="50"
              step="1"
              value={params.expenditureRateAdjustment}
              onChange={e => setParams({ ...params, expenditureRateAdjustment: Number(e.target.value) })}
              className="w-full accent-silver-bright bg-obsidian-4 cursor-pointer"
            />
            <div className="flex justify-between text-[0.62rem] font-mono text-bone-faint mt-1">
              <span>-25% Capital Freeze</span>
              <span>Baseline (0%)</span>
              <span>+50% Overspending</span>
            </div>
          </div>

          {/* Slider 3: Schedule Recovery Buffer */}
          <div>
            <div className="flex justify-between items-center mb-1.5 font-mono text-xs">
              <span className="text-bone-2">Critical-Path Fast Track Buffer</span>
              <span className="font-bold text-silver-bright">
                {params.scheduleRecoveryBuffer} months
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              step="0.5"
              value={params.scheduleRecoveryBuffer}
              onChange={e => setParams({ ...params, scheduleRecoveryBuffer: Number(e.target.value) })}
              className="w-full accent-silver-bright bg-obsidian-4 cursor-pointer"
            />
            <div className="flex justify-between text-[0.62rem] font-mono text-bone-faint mt-1">
              <span>0 mo (No compression)</span>
              <span>3 mos (Double shifts)</span>
              <span>6 mos (Full fast-track)</span>
            </div>
          </div>

          {/* Slider 4: Material Cost Inflation */}
          <div>
            <div className="flex justify-between items-center mb-1.5 font-mono text-xs">
              <span className="text-bone-2">Commodity Price Inflation</span>
              <span className="font-bold text-bone-muted">
                +{params.materialInflationFactor}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="1"
              value={params.materialInflationFactor}
              onChange={e => setParams({ ...params, materialInflationFactor: Number(e.target.value) })}
              className="w-full accent-silver-bright bg-obsidian-4 cursor-pointer"
            />
            <div className="flex justify-between text-[0.62rem] font-mono text-bone-faint mt-1">
              <span>0% Stable</span>
              <span>7.5% Moderate</span>
              <span>15% High Surge</span>
            </div>
          </div>
        </AurumCard>

        {/* Dynamic Outcome Column */}
        <AurumCard variant="showcase" className="lg:col-span-6 p-6 flex flex-col justify-between space-y-6 hover-glow-card">
          <div>
            <div className="flex items-center justify-between border-b border-silver/10 pb-3">
              <div>
                <span className="mono-label">PROJECTED IMPACT</span>
                <h4 className="font-display text-lg text-bone">Simulated Telemetry</h4>
              </div>
              <AurumBadge status={outcome.newRiskLevel} />
            </div>

            {/* Metrics Comparison Grid */}
            <div className="grid grid-cols-2 gap-4 mt-5 font-mono">
              {/* Cost Outcome */}
              <div className="p-4 rounded-xl bg-obsidian-3/90 border border-silver/10">
                <span className="text-bone-muted text-[0.68rem] uppercase block">PROJECTED FINAL COST</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-display text-2xl font-light text-bone">
                    ₹{outcome.simulatedCost.toFixed(1)}
                  </span>
                  <span className="text-xs text-bone-muted">Cr</span>
                </div>
                <div className="mt-1 text-xs">
                  <span className={outcome.costDelta > 0 ? 'text-red-300' : 'text-emerald-300'}>
                    {outcome.costDelta >= 0 ? `+₹${outcome.costDelta.toFixed(1)}` : `-₹${Math.abs(outcome.costDelta).toFixed(1)}`} Cr
                  </span>
                  <span className="text-bone-faint text-[0.68rem] ml-1">vs current forecast</span>
                </div>
              </div>

              {/* Schedule Outcome */}
              <div className="p-4 rounded-xl bg-obsidian-3/90 border border-silver/10">
                <span className="text-bone-muted text-[0.68rem] uppercase block">COMPLETION TIMELINE</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-display text-2xl font-light text-bone">
                    M{outcome.simulatedCompletionMonth.toFixed(1)}
                  </span>
                </div>
                <div className="mt-1 text-xs">
                  <span className={outcome.scheduleDeltaMonths < 0 ? 'text-emerald-300' : 'text-amber-300'}>
                    {outcome.scheduleDeltaMonths <= 0 ? `${outcome.scheduleDeltaMonths} mos` : `+${outcome.scheduleDeltaMonths} mos`}
                  </span>
                  <span className="text-bone-faint text-[0.68rem] ml-1">variance</span>
                </div>
              </div>

              {/* Dynamic Risk Score */}
              <div className="p-4 rounded-xl bg-obsidian-3/90 border border-silver/10">
                <span className="text-bone-muted text-[0.68rem] uppercase block">NEW RISK SCORE</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display text-2xl font-light text-bone">
                    {outcome.simulatedRiskScore}
                  </span>
                  <span className="text-xs text-bone-muted">/ 100</span>
                </div>
                <div className="mt-1 text-xs">
                  <span className={outcome.riskScoreDelta <= 0 ? 'text-emerald-300' : 'text-red-300'}>
                    {outcome.riskScoreDelta <= 0 ? `${outcome.riskScoreDelta} pts` : `+${outcome.riskScoreDelta} pts`}
                  </span>
                  <span className="text-bone-faint text-[0.68rem] ml-1">vs baseline</span>
                </div>
              </div>

              {/* Efficiency Indices */}
              <div className="p-4 rounded-xl bg-obsidian-3/90 border border-silver/10">
                <span className="text-bone-muted text-[0.68rem] uppercase block">SIMULATED CPI / SPI</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display text-2xl font-light text-silver-bright">
                    {outcome.simulatedCpi} / {outcome.simulatedSpi}
                  </span>
                </div>
                <p className="text-[0.68rem] text-bone-muted mt-1">Efficiency trajectory</p>
              </div>
            </div>

            {/* Assumptions List */}
            <div className="mt-5 p-3.5 rounded-xl bg-obsidian-1/70 border border-silver/10">
              <span className="mono-label block text-bone-faint mb-2">MODELED ASSUMPTIONS</span>
              <ul className="space-y-1.5 text-xs text-bone-muted font-sans pl-1">
                {outcome.assumptions.map((assump, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-silver-bright text-xs shrink-0">•</span>
                    <span>{assump}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action to Apply Scenario */}
          <div className="pt-2 border-t border-silver/10 flex items-center justify-between gap-3">
            <div className="text-[0.68rem] font-mono text-bone-muted flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-amber-400 shrink-0" />
              <span>Non-linear compression model active</span>
            </div>

            <AurumButton
              variant="primary"
              size="sm"
              onClick={handleApplyToProject}
              icon={<BookmarkCheck size={14} />}
            >
              COMMIT SCENARIO TARGETS
            </AurumButton>
          </div>
        </AurumCard>
      </div>
    </div>
  );
};
