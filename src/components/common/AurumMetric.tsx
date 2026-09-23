import React from 'react';
import { AurumCard } from './AurumCard';

interface AurumMetricProps {
  label: string;
  value: string | number;
  subValue?: string;
  delta?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  indicator?: 'silver' | 'warning' | 'alert' | 'success';
  icon?: React.ReactNode;
  className?: string;
}

export const AurumMetric: React.FC<AurumMetricProps> = ({
  label,
  value,
  subValue,
  delta,
  indicator = 'silver',
  icon,
  className = '',
}) => {
  return (
    <AurumCard variant="compact" className={`p-4 md:p-5 ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="mono-label">{label}</span>
        {icon && <span className="text-silver-deep text-sm">{icon}</span>}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="font-display text-2xl md:text-3xl font-light text-bone tracking-tight">
          {value}
        </span>
        {subValue && (
          <span className="text-xs text-bone-muted font-sans">{subValue}</span>
        )}
      </div>

      {delta && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          <span
            className={`font-mono text-[0.7rem] px-1.5 py-0.5 rounded-sm ${
              delta.isNeutral
                ? 'bg-graphite/40 text-bone-muted'
                : delta.isPositive
                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/30'
                : 'bg-red-950/40 text-red-300 border border-red-800/30'
            }`}
          >
            {delta.value}
          </span>
          <span className="text-[0.72rem] text-bone-muted">vs baseline</span>
        </div>
      )}
    </AurumCard>
  );
};
