import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ProgressReport } from '../../types/project';
import { AurumCard } from '../common/AurumCard';

interface ProjectSCurveChartProps {
  trajectory: ProgressReport[];
  title?: string;
  projectName?: string;
}

export const ProjectSCurveChart: React.FC<ProjectSCurveChartProps> = ({
  trajectory,
  title = 'PROGRESS & COST TRAJECTORY (S-CURVE)',
  projectName,
}) => {
  const [metricMode, setMetricMode] = useState<'progress' | 'cost'>('progress');

  // Custom Aurum Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-obsidian-2/95 border border-silver/20 rounded-xl p-3 shadow-deep font-sans text-xs">
          <p className="font-mono text-silver-bright mb-1.5 font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
              <span className="text-bone-muted flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-mono font-medium text-bone">
                {metricMode === 'progress' ? `${entry.value}%` : `₹${entry.value} Cr`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <AurumCard variant="showcase" className="p-5 md:p-6">
      {/* Header with Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <span className="mono-label">{title}</span>
          <h3 className="font-display text-lg md:text-xl text-bone mt-0.5">
            {projectName ? `${projectName} — ` : ''}
            {metricMode === 'progress' ? 'Physical S-Curve Trajectory' : 'Financial Expenditure Burn'}
          </h3>
        </div>

        {/* Tab Controls */}
        <div className="inline-flex p-1 rounded-full bg-obsidian-3 border border-silver/10 self-start sm:self-auto">
          <button
            onClick={() => setMetricMode('progress')}
            className={`
              px-3 py-1 text-xs font-mono rounded-full transition-all
              ${
                metricMode === 'progress'
                  ? 'bg-gradient-to-r from-silver-bright to-silver text-obsidian-0 font-semibold shadow-sm'
                  : 'text-bone-muted hover:text-bone'
              }
            `}
          >
            PHYSICAL PROGRESS (%)
          </button>
          <button
            onClick={() => setMetricMode('cost')}
            className={`
              px-3 py-1 text-xs font-mono rounded-full transition-all
              ${
                metricMode === 'cost'
                  ? 'bg-gradient-to-r from-silver-bright to-silver text-obsidian-0 font-semibold shadow-sm'
                  : 'text-bone-muted hover:text-bone'
              }
            `}
          >
            EXPENDITURE (₹ CR)
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="w-full h-72 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trajectory} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            {/* Very subtle graphite grid */}
            <CartesianGrid stroke="#1f242c" strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="reportDate"
              stroke="#5e6675"
              tick={{ fill: '#8a94a4', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              tickLine={{ stroke: '#1f242c' }}
            />

            <YAxis
              stroke="#5e6675"
              tick={{ fill: '#8a94a4', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              tickLine={{ stroke: '#1f242c' }}
              unit={metricMode === 'progress' ? '%' : ' Cr'}
              domain={[0, 'auto']}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              wrapperStyle={{ paddingTop: '15px', fontFamily: 'JetBrains Mono', fontSize: '11px' }}
            />

            {/* S-Curve lines: Planned (steel), Actual (silver-bright), Forecast (dashed amber/silver) */}
            {metricMode === 'progress' ? (
              <>
                <Line
                  type="monotone"
                  dataKey="plannedProgress"
                  name="Planned Baseline"
                  stroke="#6b7788"
                  strokeWidth={2}
                  dot={{ fill: '#6b7788', r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="actualProgress"
                  name="Actual Progress"
                  stroke="#e4e8ee"
                  strokeWidth={3}
                  dot={{ fill: '#ffffff', r: 4, stroke: '#101318', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="forecastProgress"
                  name="AI Forecast Trajectory"
                  stroke="#fb923c"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  dot={{ fill: '#fb923c', r: 3 }}
                  connectNulls
                />
              </>
            ) : (
              <>
                <Line
                  type="monotone"
                  dataKey="plannedExpenditure"
                  name="Planned Budget"
                  stroke="#6b7788"
                  strokeWidth={2}
                  dot={{ fill: '#6b7788', r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="actualExpenditure"
                  name="Actual Expenditure"
                  stroke="#b8c0cc"
                  strokeWidth={3}
                  dot={{ fill: '#e4e8ee', r: 4, stroke: '#101318', strokeWidth: 2 }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="forecastExpenditure"
                  name="Projected EAC Burn"
                  stroke="#f87171"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  dot={{ fill: '#f87171', r: 3 }}
                  connectNulls
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trajectory Insights Banner */}
      <div className="mt-4 pt-3 border-t border-silver/10 flex flex-wrap items-center justify-between text-xs text-bone-muted">
        <span className="font-mono text-[0.7rem] text-silver">
          {metricMode === 'progress'
            ? 'CRITICAL DIVERGENCE: Current completion is -28% behind planned target milestone.'
            : 'BUDGET DRIFT: Monthly burn rate is exceeding planned value velocity by 18.4%.'}
        </span>
        <span className="font-mono text-[0.68rem] text-bone-faint">
          EVALUATED AT MONTH 30 OF 36
        </span>
      </div>
    </AurumCard>
  );
};
