import React from 'react';
import { Project } from '../../types/project';
import { AurumBadge } from '../common/AurumBadge';
import { AurumCard } from '../common/AurumCard';
import { Database, AlertTriangle, Cpu } from 'lucide-react';

interface CopilotContextDrawerProps {
  project: Project;
}

export const CopilotContextDrawer: React.FC<CopilotContextDrawerProps> = ({ project }) => {
  return (
    <AurumCard variant="showcase" className="p-5 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-silver/10">
          <Database size={15} className="text-silver-bright" />
          <span className="mono-label">ACTIVE TELEMETRY CONTEXT</span>
        </div>

        {/* Project Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-mono text-[0.65rem] text-bone-muted">{project.code}</span>
            <AurumBadge status={project.status} size="sm" />
          </div>
          <h3 className="font-display text-base text-bone font-medium leading-snug">
            {project.name}
          </h3>
          <p className="text-xs text-bone-muted mt-0.5">{project.location}</p>
        </div>

        {/* Quick telemetry grid */}
        <div className="space-y-3 font-mono text-xs">
          <div className="p-2.5 rounded-lg bg-obsidian-3/80 border border-silver/10 flex justify-between items-center">
            <span className="text-bone-muted text-[0.7rem]">RISK SCORE</span>
            <span className="font-bold text-red-300 text-sm">{project.riskScore} / 100</span>
          </div>

          <div className="p-2.5 rounded-lg bg-obsidian-3/80 border border-silver/10 flex justify-between items-center">
            <span className="text-bone-muted text-[0.7rem]">PHYSICAL PROGRESS</span>
            <span className="text-bone font-medium">{project.physicalProgress}%</span>
          </div>

          <div className="p-2.5 rounded-lg bg-obsidian-3/80 border border-silver/10 flex justify-between items-center">
            <span className="text-bone-muted text-[0.7rem]">EXPENDITURE</span>
            <span className="text-bone font-medium">₹{project.currentExpenditure} / ₹{project.plannedCost} Cr</span>
          </div>

          <div className="p-2.5 rounded-lg bg-obsidian-3/80 border border-silver/10 flex justify-between items-center">
            <span className="text-bone-muted text-[0.7rem]">ELAPSED DURATION</span>
            <span className="text-bone font-medium">{project.elapsedDuration} / {project.plannedDuration} mos</span>
          </div>

          <div className="p-2.5 rounded-lg bg-obsidian-3/80 border border-silver/10 flex justify-between items-center">
            <span className="text-bone-muted text-[0.7rem]">CPI / SPI</span>
            <span className="text-silver-bright font-medium">{project.evm.cpi} / {project.evm.spi}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-obsidian-3/80 border border-silver/10 flex justify-between items-center">
            <span className="text-bone-muted text-[0.7rem]">PREDICTED OVERRUN</span>
            <span className="text-amber-300 font-medium">₹{project.prediction.predictedCostOverrun} Cr (+{project.prediction.predictedTimeOverrun}m)</span>
          </div>
        </div>

        {/* Active alert indicator */}
        {project.alerts.length > 0 && (
          <div className="mt-4 pt-3 border-t border-silver/10">
            <div className="flex items-center gap-1.5 text-xs text-orange-300 mb-1.5">
              <AlertTriangle size={14} />
              <span className="font-mono text-[0.68rem] tracking-wider uppercase font-semibold">
                ACTIVE ALERTS ({project.alerts.length})
              </span>
            </div>
            <p className="text-[0.72rem] text-bone-muted line-clamp-2">
              {project.alerts[0].signal}
            </p>
          </div>
        )}
      </div>

      {/* Intelligence engine signature */}
      <div className="pt-4 border-t border-silver/10 mt-4 flex items-center justify-between text-[0.65rem] font-mono text-bone-faint">
        <span className="flex items-center gap-1">
          <Cpu size={12} className="text-emerald-400" />
          GROUNDED TELEMETRY
        </span>
        <span>XGBOOST v2.4</span>
      </div>
    </AurumCard>
  );
};
