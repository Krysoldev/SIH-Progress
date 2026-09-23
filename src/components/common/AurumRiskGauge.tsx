import React from 'react';
import { RiskBreakdown } from '../../types/project';
import { AurumBadge } from './AurumBadge';

interface AurumRiskGaugeProps {
  score: number;
  breakdown?: RiskBreakdown;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

export const AurumRiskGauge: React.FC<AurumRiskGaugeProps> = ({
  score,
  breakdown,
  size = 'md',
  showDetails = true,
  className = '',
}) => {
  // SVG circular arc geometry
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getStatusText = (s: number) => {
    if (s >= 80) return 'CRITICAL ATTENTION';
    if (s >= 65) return 'HIGH ATTENTION';
    if (s >= 40) return 'WATCH STATUS';
    return 'STABLE';
  };

  const getStrokeColor = (s: number) => {
    if (s >= 80) return '#f87171'; // red-400
    if (s >= 65) return '#fb923c'; // orange-400
    if (s >= 40) return '#facc15'; // amber-400
    return '#34d399'; // emerald-400
  };

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* Circular Gauge */}
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#1f242c"
            strokeWidth="7"
            fill="transparent"
          />
          {/* Active progress arc */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={getStrokeColor(score)}
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-light text-bone tracking-tight">
            {score}
          </span>
          <span className="font-mono text-[0.65rem] text-bone-muted uppercase tracking-widest">
            / 100
          </span>
        </div>
      </div>

      {/* Status Pill */}
      <div className="mt-2">
        <AurumBadge status={breakdown?.riskLevel || (score >= 65 ? 'AT RISK' : 'ON TRACK')} pulse={score >= 75} />
        <p className="font-mono text-[0.68rem] tracking-wider uppercase text-bone-muted mt-1">
          {getStatusText(score)}
        </p>
      </div>

      {/* Component Risk Breakdown Bars */}
      {showDetails && breakdown && (
        <div className="w-full mt-5 space-y-3 text-left border-t border-silver/10 pt-4">
          <RiskBar label="Schedule Risk" value={breakdown.scheduleRisk} />
          <RiskBar label="Cost Risk" value={breakdown.costRisk} />
          <RiskBar label="Progress Risk" value={breakdown.progressRisk} />
          <RiskBar label="Milestone Risk" value={breakdown.milestoneRisk} />
        </div>
      )}
    </div>
  );
};

const RiskBar: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const getBarColor = (val: number) => {
    if (val >= 80) return 'bg-red-400';
    if (val >= 65) return 'bg-orange-400';
    if (val >= 40) return 'bg-amber-400';
    return 'bg-silver';
  };

  return (
    <div>
      <div className="flex justify-between items-center text-xs mb-1">
        <span className="text-bone-muted font-sans text-[0.78rem]">{label}</span>
        <span className="font-mono text-bone text-[0.75rem] font-medium">{value}</span>
      </div>
      <div className="w-full h-1.5 bg-obsidian-4 rounded-full overflow-hidden">
        <div
          className={`h-full ${getBarColor(value)} transition-all duration-500 rounded-full`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};
