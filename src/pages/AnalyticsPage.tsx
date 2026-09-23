import React from 'react';
import { useProjects } from '../context/ProjectContext';
import { ScreenId } from '../components/layout/AurumSidebar';
import { AurumCard } from '../components/common/AurumCard';
import { AurumMetric } from '../components/common/AurumMetric';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, BarChart3, HelpCircle, ArrowRight } from 'lucide-react';

interface AnalyticsPageProps {
  onNavigate: (screen: ScreenId) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onNavigate }) => {
  const { projects, setSelectedProject } = useProjects();

  // EVM data across all projects
  const evmData = projects.map(p => ({
    name: p.name.split(' ')[0],
    fullName: p.name,
    cpi: p.evm.cpi,
    spi: p.evm.spi,
    cost: p.plannedCost,
    spent: p.currentExpenditure,
    status: p.status,
    id: p.id,
  }));

  // Budget Variance data
  const budgetData = projects.map(p => ({
    name: p.name.split(' ')[0],
    budget: p.plannedCost,
    spent: p.currentExpenditure,
    projected: Number(p.evm.eac.toFixed(1)),
    variance: Number(p.evm.vac.toFixed(1)),
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-silver/10 pb-5">
        <div>
          <span className="mono-label">PORTFOLIO CAPITAL ANALYTICS</span>
          <h1 className="font-display text-3xl md:text-4xl text-bone font-light tracking-tight mt-0.5">
            EVM & PERFORMANCE ANALYTICS
          </h1>
          <p className="text-bone-muted text-xs md:text-sm mt-1">
            Earned Value Management (ANSI/EIA-748) and capital expenditure trajectories.
          </p>
        </div>

        <button
          onClick={() => onNavigate('reports')}
          className="btn-aurum-primary text-xs"
        >
          <span>EXPORT ANALYTICS REPORT</span>
        </button>
      </div>

      {/* EVM CPI vs SPI Quadrant Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <AurumCard variant="showcase" className="lg:col-span-8 p-5 md:p-6">
          <div className="flex items-center justify-between mb-4 border-b border-silver/10 pb-3">
            <div>
              <span className="mono-label">EFFICIENCY QUADRANT</span>
              <h3 className="font-display text-lg text-bone">CPI vs SPI Performance Matrix</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-bone-muted">
              <span>Benchmark (1.0, 1.0)</span>
            </div>
          </div>

          <p className="text-xs text-bone-muted mb-4 font-sans">
            Top-right quadrant represents optimal delivery (Ahead of schedule & under budget). Bottom-left represents high-risk exposure (Behind schedule & over budget).
          </p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evmData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#1f242c" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#5e6675" tick={{ fill: '#8a94a4', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <YAxis stroke="#5e6675" tick={{ fill: '#8a94a4', fontSize: 11, fontFamily: 'JetBrains Mono' }} domain={[0, 1.5]} />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-obsidian-2 border border-silver/20 rounded-xl p-3 shadow-deep font-sans text-xs">
                          <p className="font-semibold text-bone">{data.fullName}</p>
                          <p className="font-mono text-silver mt-1">CPI: {data.cpi} | SPI: {data.spi}</p>
                          <p className="font-mono text-bone-muted">Status: {data.status}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '11px', paddingTop: '10px' }} />
                <ReferenceLine y={1.0} stroke="#b8c0cc" strokeDasharray="3 3" label={{ value: 'Target 1.0', fill: '#8a94a4', fontSize: 10 }} />
                <Bar dataKey="cpi" name="Cost Performance Index (CPI)" fill="#e4e8ee" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spi" name="Schedule Performance Index (SPI)" fill="#6b7788" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AurumCard>

        {/* EVM Interpretation Guide (4 cols) */}
        <AurumCard variant="showcase" className="lg:col-span-4 p-5 md:p-6 flex flex-col justify-between">
          <div>
            <div className="border-b border-silver/10 pb-3 mb-4">
              <span className="mono-label">METHODOLOGY</span>
              <h3 className="font-display text-lg text-bone">EVM Health Thresholds</h3>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-obsidian-3/80 border border-silver/10">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-emerald-300 font-semibold">CPI / SPI &gt; 1.0</span>
                  <span className="text-bone-muted text-[0.65rem]">OPTIMAL</span>
                </div>
                <p className="text-bone-2 text-[0.72rem] font-sans">
                  Work is being performed with higher efficiency than contract baseline.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-obsidian-3/80 border border-silver/10">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-amber-300 font-semibold">0.85 &lt; Index &lt; 1.0</span>
                  <span className="text-bone-muted text-[0.65rem]">MONITOR</span>
                </div>
                <p className="text-bone-2 text-[0.72rem] font-sans">
                  Minor slip requiring operational adjustment before contingency is exhausted.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-obsidian-3/80 border border-silver/10">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-red-300 font-semibold">CPI / SPI &lt; 0.85</span>
                  <span className="text-bone-muted text-[0.65rem]">CRITICAL DEFICIT</span>
                </div>
                <p className="text-bone-2 text-[0.72rem] font-sans">
                  Contractual crisis. Highway Expansion (CPI: 0.81) and Port (CPI: 0.57) require urgent restructuring.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('simulation')}
            className="w-full mt-4 py-2 px-3 rounded-xl bg-obsidian-3 hover:bg-obsidian-4 border border-silver/15 text-xs font-mono text-silver-bright flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>SIMULATE RECOVERY LEVERS</span>
            <ArrowRight size={13} />
          </button>
        </AurumCard>
      </div>

      {/* Budget at Completion (BAC) vs Estimate at Completion (EAC) Chart */}
      <AurumCard variant="showcase" className="p-5 md:p-6">
        <div className="flex items-center justify-between mb-4 border-b border-silver/10 pb-3">
          <div>
            <span className="mono-label">CAPITAL BUDGET INTEGRITY</span>
            <h3 className="font-display text-lg text-bone">Budgeted (BAC) vs Forecasted EAC (₹ Cr)</h3>
          </div>
          <span className="font-mono text-xs text-bone-muted">Values in ₹ Crore</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={budgetData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="#1f242c" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke="#5e6675" tick={{ fill: '#8a94a4', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
              <YAxis stroke="#5e6675" tick={{ fill: '#8a94a4', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
              <Tooltip
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-obsidian-2 border border-silver/20 rounded-xl p-3 shadow-deep font-sans text-xs">
                        <p className="font-semibold text-bone">{d.name}</p>
                        <p className="font-mono text-bone-muted">Planned: ₹{d.budget} Cr</p>
                        <p className="font-mono text-bone">Spent: ₹{d.spent} Cr</p>
                        <p className="font-mono text-silver-bright">Projected EAC: ₹{d.projected} Cr</p>
                        <p className={`font-mono font-bold ${d.variance < 0 ? 'text-red-300' : 'text-emerald-300'}`}>
                          Variance: {d.variance < 0 ? `-₹${Math.abs(d.variance)} Cr` : `+₹${d.variance} Cr`}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="budget" name="Planned Budget (BAC)" fill="#6b7788" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spent" name="Actual Spent to Date" fill="#b8c0cc" radius={[4, 4, 0, 0]} />
              <Bar dataKey="projected" name="Projected EAC" fill="#e4e8ee" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </AurumCard>
    </div>
  );
};
