import React from 'react';
import { Project } from '../../types/project';
import { AurumBadge } from '../common/AurumBadge';
import { ChevronRight, ArrowUpDown } from 'lucide-react';

interface ActiveProjectsTableProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  selectedProjectId?: string;
}

export const ActiveProjectsTable: React.FC<ActiveProjectsTableProps> = ({
  projects,
  onSelectProject,
  selectedProjectId,
}) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-silver/10 font-mono text-[0.68rem] uppercase tracking-wider text-bone-muted">
            <th className="py-3 px-4">PROJECT</th>
            <th className="py-3 px-3">LOCATION</th>
            <th className="py-3 px-3">PROGRESS</th>
            <th className="py-3 px-3">COST (₹ CR)</th>
            <th className="py-3 px-3">SCHEDULE</th>
            <th className="py-3 px-3">RISK</th>
            <th className="py-3 px-3">STATUS</th>
            <th className="py-3 px-3 text-right">LAST UPDATE</th>
            <th className="py-3 px-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-silver/5 font-sans text-xs">
          {projects.map(proj => {
            const isSelected = proj.id === selectedProjectId;
            const delay = proj.prediction.predictedTimeOverrun;

            return (
              <tr
                key={proj.id}
                onClick={() => onSelectProject(proj)}
                className={`
                  group cursor-pointer transition-all duration-150
                  ${
                    isSelected
                      ? 'bg-obsidian-3/90 border-l-2 border-l-silver-bright'
                      : 'hover:bg-obsidian-3/50'
                  }
                `}
              >
                {/* Project Name & Code */}
                <td className="py-3.5 px-4">
                  <div className="font-medium text-bone group-hover:text-silver-bright transition-colors">
                    {proj.name}
                  </div>
                  <div className="font-mono text-[0.65rem] text-bone-muted mt-0.5">
                    {proj.code} • {proj.category}
                  </div>
                </td>

                {/* Location */}
                <td className="py-3.5 px-3 text-bone-muted whitespace-nowrap">
                  {proj.state}
                </td>

                {/* Physical Progress */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-bone">
                      {proj.physicalProgress}%
                    </span>
                    <div className="w-16 h-1.5 bg-obsidian-4 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="h-full bg-gradient-to-r from-silver-deep to-silver-bright rounded-full"
                        style={{ width: `${proj.physicalProgress}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Cost */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <div className="font-mono text-bone font-medium">
                    ₹{proj.currentExpenditure} <span className="text-bone-muted text-[0.68rem]">/ {proj.plannedCost}</span>
                  </div>
                  <div className="font-mono text-[0.62rem] text-bone-faint">
                    CPI: {proj.evm.cpi}
                  </div>
                </td>

                {/* Schedule Delay */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <span
                    className={`font-mono ${
                      delay === 0
                        ? 'text-emerald-300'
                        : delay > 3
                        ? 'text-red-300 font-medium'
                        : 'text-amber-200'
                    }`}
                  >
                    {delay === 0 ? 'On Schedule' : `+${delay} mos`}
                  </span>
                </td>

                {/* Risk Score */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`
                        font-mono font-bold text-xs px-2 py-0.5 rounded
                        ${
                          proj.riskScore >= 75
                            ? 'bg-red-950/60 text-red-200 border border-red-800/40'
                            : proj.riskScore >= 60
                            ? 'bg-orange-950/60 text-orange-200 border border-orange-800/40'
                            : proj.riskScore >= 40
                            ? 'bg-amber-950/60 text-amber-200 border border-amber-800/40'
                            : 'bg-emerald-950/60 text-emerald-200 border border-emerald-800/40'
                        }
                      `}
                    >
                      {proj.riskScore}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <AurumBadge status={proj.status} size="sm" pulse={proj.status === 'CRITICAL'} />
                </td>

                {/* Last Update */}
                <td className="py-3.5 px-3 text-right font-mono text-[0.68rem] text-bone-muted whitespace-nowrap">
                  {proj.lastUpdate.split(' ')[0]}
                </td>

                {/* Arrow hint */}
                <td className="py-3.5 px-2 text-right">
                  <ChevronRight
                    size={16}
                    className="text-bone-faint group-hover:text-silver-bright group-hover:translate-x-0.5 transition-all"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
