import React from 'react';
import { EVMMetrics } from '../../types/project';
import { AurumCard } from '../common/AurumCard';
import { HelpCircle } from 'lucide-react';

interface EVMMetricsPanelProps {
  evm: EVMMetrics;
  plannedCost: number;
}

export const EVMMetricsPanel: React.FC<EVMMetricsPanelProps> = ({ evm, plannedCost }) => {
  return (
    <AurumCard variant="showcase" className="p-5 md:p-6">
      <div className="flex items-center justify-between mb-4 border-b border-silver/10 pb-3">
        <div>
          <span className="mono-label">EARNED VALUE MANAGEMENT (EVM)</span>
          <h3 className="font-display text-lg text-bone mt-0.5">Project Financial & Schedule Health</h3>
        </div>
        <div className="flex items-center gap-1 text-bone-muted text-xs font-mono">
          <HelpCircle size={14} />
          <span>ANSI/EIA-748 Standard</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6">
        {/* CPI */}
        <div className="p-3.5 rounded-xl bg-obsidian-3/80 border border-silver/10">
          <span className="mono-label">COST INDEX (CPI)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`font-display text-2xl font-light ${
                evm.cpi >= 1.0 ? 'text-emerald-300' : evm.cpi >= 0.85 ? 'text-amber-300' : 'text-red-300'
              }`}
            >
              {evm.cpi.toFixed(2)}
            </span>
          </div>
          <p className="text-[0.68rem] text-bone-muted mt-1">
            {evm.cpi < 1 ? 'Over budget velocity' : 'Within budget efficiency'}
          </p>
        </div>

        {/* SPI */}
        <div className="p-3.5 rounded-xl bg-obsidian-3/80 border border-silver/10">
          <span className="mono-label">SCHEDULE INDEX (SPI)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`font-display text-2xl font-light ${
                evm.spi >= 1.0 ? 'text-emerald-300' : evm.spi >= 0.85 ? 'text-amber-300' : 'text-red-300'
              }`}
            >
              {evm.spi.toFixed(2)}
            </span>
          </div>
          <p className="text-[0.68rem] text-bone-muted mt-1">
            {evm.spi < 1 ? 'Behind contractual schedule' : 'On or ahead of schedule'}
          </p>
        </div>

        {/* EAC */}
        <div className="p-3.5 rounded-xl bg-obsidian-3/80 border border-silver/10">
          <span className="mono-label">ESTIMATE AT COMPLETION</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-display text-2xl font-light text-bone">
              ₹{evm.eac.toFixed(1)}
            </span>
            <span className="text-[0.7rem] font-mono text-bone-muted">Cr</span>
          </div>
          <p className="text-[0.68rem] text-bone-muted mt-1">
            Baseline: ₹{plannedCost} Cr
          </p>
        </div>

        {/* VAC */}
        <div className="p-3.5 rounded-xl bg-obsidian-3/80 border border-silver/10">
          <span className="mono-label">VARIANCE AT COMPLETION</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`font-display text-2xl font-light ${
                evm.vac >= 0 ? 'text-emerald-300' : 'text-red-300'
              }`}
            >
              {evm.vac >= 0 ? `+₹${evm.vac.toFixed(1)}` : `-₹${Math.abs(evm.vac).toFixed(1)}`}
            </span>
            <span className="text-[0.7rem] font-mono text-bone-muted">Cr</span>
          </div>
          <p className="text-[0.68rem] text-bone-muted mt-1">
            {evm.vac < 0 ? 'Projected budget deficit' : 'Projected savings'}
          </p>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-silver/10 text-xs font-mono">
        <div className="p-2">
          <span className="text-bone-muted text-[0.68rem] block">PLANNED VALUE (PV)</span>
          <span className="text-bone font-medium text-sm">₹{evm.pv.toFixed(1)} Cr</span>
        </div>
        <div className="p-2">
          <span className="text-bone-muted text-[0.68rem] block">EARNED VALUE (EV)</span>
          <span className="text-bone font-medium text-sm">₹{evm.ev.toFixed(1)} Cr</span>
        </div>
        <div className="p-2">
          <span className="text-bone-muted text-[0.68rem] block">ACTUAL COST (AC)</span>
          <span className="text-bone font-medium text-sm">₹{evm.ac.toFixed(1)} Cr</span>
        </div>
        <div className="p-2">
          <span className="text-bone-muted text-[0.68rem] block">TO-COMPLETE PI (TCPI)</span>
          <span className="text-bone font-medium text-sm">{evm.tcpi.toFixed(2)}</span>
        </div>
      </div>
    </AurumCard>
  );
};
