import React from 'react';
import { ProjectStatus, RiskLevel, AlertType } from '../../types/project';

interface AurumBadgeProps {
  status?: ProjectStatus | RiskLevel | AlertType | string;
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export const AurumBadge: React.FC<AurumBadgeProps> = ({
  status = 'ON TRACK',
  size = 'md',
  pulse = false,
  className = '',
}) => {
  // Controlled Aurum color mapping: Restrained signals, never loud neon
  const getBadgeStyle = () => {
    switch (status) {
      case 'ON TRACK':
      case 'LOW':
        return {
          bg: 'bg-obsidian-3/90',
          border: 'border-emerald-600/30',
          text: 'text-emerald-300/90',
          dot: 'bg-emerald-400',
        };
      case 'WATCH':
      case 'MEDIUM':
        return {
          bg: 'bg-obsidian-3/90',
          border: 'border-amber-600/30',
          text: 'text-amber-200/90',
          dot: 'bg-amber-400',
        };
      case 'AT RISK':
      case 'HIGH':
        return {
          bg: 'bg-obsidian-3/90',
          border: 'border-orange-500/40',
          text: 'text-orange-200',
          dot: 'bg-orange-400',
        };
      case 'CRITICAL':
        return {
          bg: 'bg-obsidian-3/90',
          border: 'border-red-600/40',
          text: 'text-red-200',
          dot: 'bg-red-400',
        };
      case 'SCHEDULE':
        return {
          bg: 'bg-obsidian-4/80',
          border: 'border-silver/20',
          text: 'text-bone',
          dot: 'bg-silver',
        };
      case 'COST':
        return {
          bg: 'bg-obsidian-4/80',
          border: 'border-silver/20',
          text: 'text-bone',
          dot: 'bg-silver-bright',
        };
      case 'MILESTONE':
      case 'PROGRESS':
        return {
          bg: 'bg-obsidian-4/80',
          border: 'border-silver/20',
          text: 'text-bone-2',
          dot: 'bg-silver-deep',
        };
      default:
        return {
          bg: 'bg-obsidian-3/80',
          border: 'border-silver/15',
          text: 'text-bone-muted',
          dot: 'bg-steel',
        };
    }
  };

  const style = getBadgeStyle();
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[0.65rem]' : 'px-2.5 py-1 text-[0.72rem]';

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-mono uppercase tracking-wider
        rounded-pill border shadow-sm select-none
        ${style.bg} ${style.border} ${style.text} ${sizeClass}
        ${className}
      `}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${style.dot} ${pulse ? 'animate-pulse' : ''}`}
        aria-hidden="true"
      />
      <span>{status}</span>
    </span>
  );
};
