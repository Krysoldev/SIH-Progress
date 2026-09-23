import React from 'react';
import { Milestone, MilestoneStatus } from '../../types/project';
import { CheckCircle2, Clock, AlertTriangle, Circle } from 'lucide-react';
import { AurumCard } from '../common/AurumCard';

interface MilestoneTrackerProps {
  milestones: Milestone[];
  onUpdateStatus?: (milestoneId: string, status: MilestoneStatus) => void;
  readOnly?: boolean;
}

export const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({
  milestones,
  onUpdateStatus,
  readOnly = false,
}) => {
  const getStatusIcon = (status: MilestoneStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />;
      case 'IN_PROGRESS':
        return <Clock size={16} className="text-amber-400 shrink-0 animate-spin-slow" />;
      case 'DELAYED':
        return <AlertTriangle size={16} className="text-red-400 shrink-0" />;
      case 'PENDING':
      default:
        return <Circle size={16} className="text-steel shrink-0" />;
    }
  };

  const getStatusBadge = (status: MilestoneStatus, delay: number) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="font-mono text-[0.65rem] text-emerald-300">COMPLETED</span>;
      case 'IN_PROGRESS':
        return <span className="font-mono text-[0.65rem] text-amber-300">IN PROGRESS {delay > 0 ? `(+${delay}m)` : ''}</span>;
      case 'DELAYED':
        return <span className="font-mono text-[0.65rem] text-red-300 font-semibold">DELAYED (+{delay}m)</span>;
      case 'PENDING':
      default:
        return <span className="font-mono text-[0.65rem] text-bone-muted">SCHEDULED</span>;
    }
  };

  return (
    <AurumCard variant="showcase" className="p-5 md:p-6">
      <div className="flex items-center justify-between mb-4 border-b border-silver/10 pb-3">
        <div>
          <span className="mono-label">STAGE-GATE MILESTONE CONTROL</span>
          <h3 className="font-display text-lg text-bone mt-0.5">Critical Path Milestones</h3>
        </div>
        <span className="font-mono text-xs text-bone-muted">
          {milestones.filter(m => m.status === 'COMPLETED').length} / {milestones.length} Completed
        </span>
      </div>

      <div className="space-y-3">
        {milestones.map((ms, idx) => (
          <div
            key={ms.id}
            className={`
              p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3
              ${
                ms.status === 'DELAYED'
                  ? 'bg-red-950/20 border-red-900/30'
                  : ms.status === 'COMPLETED'
                  ? 'bg-obsidian-3/40 border-silver/5'
                  : 'bg-obsidian-3/80 border-silver/10'
              }
            `}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getStatusIcon(ms.status)}</div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-medium text-bone">{ms.name}</h4>
                  {ms.criticalPath && (
                    <span className="font-mono text-[0.62rem] px-1.5 py-0.2 rounded bg-graphite/60 text-silver border border-silver/15 uppercase">
                      Critical Path
                    </span>
                  )}
                  <span className="font-mono text-[0.62rem] text-bone-faint">
                    wt: {ms.weightage}%
                  </span>
                </div>
                <p className="font-mono text-[0.68rem] text-bone-muted mt-0.5">
                  Target: {ms.plannedDate} {ms.actualDate ? `• Achieved: ${ms.actualDate}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 pl-7 sm:pl-0">
              {getStatusBadge(ms.status, ms.delayMonths)}

              {!readOnly && onUpdateStatus && (
                <select
                  value={ms.status}
                  onChange={e => onUpdateStatus(ms.id, e.target.value as MilestoneStatus)}
                  className="bg-obsidian-4 border border-silver/20 text-bone text-[0.7rem] font-mono rounded px-2 py-1 focus:outline-none focus:border-silver"
                  aria-label={`Change status for milestone ${ms.name}`}
                >
                  <option value="COMPLETED">Completed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DELAYED">Delayed</option>
                  <option value="PENDING">Pending</option>
                </select>
              )}
            </div>
          </div>
        ))}
      </div>
    </AurumCard>
  );
};
