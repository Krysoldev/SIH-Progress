import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { ScreenId } from '../components/layout/AurumSidebar';
import { AlertType, RiskLevel, AlertItem } from '../types/project';
import { AurumCard } from '../components/common/AurumCard';
import { AurumBadge } from '../components/common/AurumBadge';
import {
  BellRing,
  Filter,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Clock,
} from 'lucide-react';

interface AlertsPageProps {
  onNavigate: (screen: ScreenId) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ onNavigate }) => {
  const { projects, setSelectedProject, acknowledgeAlert } = useProjects();
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  // Collect all alerts across projects
  const allAlerts: { alert: AlertItem; projectId: string }[] = [];
  projects.forEach(p => {
    p.alerts.forEach(a => {
      allAlerts.push({ alert: a, projectId: p.id });
    });
  });

  const filteredAlerts = allAlerts.filter(({ alert }) => {
    const matchType = selectedType === 'ALL' || alert.alertType === selectedType;
    const matchSev = selectedSeverity === 'ALL' || alert.severity === selectedSeverity;
    return matchType && matchSev;
  });

  const handleInvestigate = (projectId: string) => {
    const found = projects.find(p => p.id === projectId);
    if (found) {
      setSelectedProject(found);
      onNavigate('copilot');
    }
  };

  const handleAcknowledge = async (projectId: string, alertId: string) => {
    await acknowledgeAlert(projectId, alertId);
  };

  const types = ['ALL', 'SCHEDULE', 'COST', 'PROGRESS', 'MILESTONE', 'RISK'];
  const severities = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-silver/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="mono-label">SIGNAL INTELLIGENCE FEED</span>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            <span className="font-mono text-[0.68rem] text-bone-muted">{filteredAlerts.length} SIGNALS DETECTED</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-bone font-light tracking-tight">
            EARLY WARNINGS & SIGNALS
          </h1>
          <p className="text-bone-muted text-xs md:text-sm mt-1">
            Continuous anomaly detection across schedule velocity, cost drift, and milestone bottlenecks.
          </p>
        </div>

        {/* Total counts badge */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-bone-muted bg-obsidian-2 px-3 py-1.5 rounded-full border border-silver/10">
            {allAlerts.filter(a => a.alert.status === 'ACTIVE').length} Active Signals
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-obsidian-2/80 border border-silver/10 text-xs font-mono">
        {/* Category Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-bone-muted">SIGNAL CATEGORY:</span>
          {types.map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`
                px-2.5 py-1 rounded-full text-[0.68rem] transition-colors
                ${selectedType === t ? 'bg-silver-bright text-obsidian-0 font-semibold' : 'bg-obsidian-3 text-bone-muted hover:text-bone'}
              `}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Severity Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-bone-muted">SEVERITY:</span>
          {severities.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSeverity(s)}
              className={`
                px-2.5 py-1 rounded-full text-[0.68rem] transition-colors
                ${selectedSeverity === s ? 'bg-silver-bright text-obsidian-0 font-semibold' : 'bg-obsidian-3 text-bone-muted hover:text-bone'}
              `}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Feed List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <AurumCard variant="showcase" className="p-12 text-center text-bone-muted font-mono text-xs">
            NO ACTIVE EARLY WARNING SIGNALS MATCHING CURRENT FILTER CRITERIA
          </AurumCard>
        ) : (
          filteredAlerts.map(({ alert, projectId }) => (
            <AurumCard
              key={alert.id}
              variant="showcase"
              className={`
                p-5 md:p-6 transition-all
                ${alert.status === 'ACKNOWLEDGED' ? 'opacity-60 bg-obsidian-1/60' : 'bg-obsidian-2/90'}
              `}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Left content */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <AurumBadge status={alert.alertType} size="sm" />
                    <AurumBadge status={alert.severity} size="sm" pulse={alert.severity === 'CRITICAL'} />
                    <span className="text-silver-dark font-mono text-xs">•</span>
                    <span className="font-mono text-xs text-silver font-semibold">{alert.projectName}</span>
                    <span className="text-silver-dark font-mono text-xs">•</span>
                    <span className="font-mono text-[0.68rem] text-bone-faint flex items-center gap-1">
                      <Clock size={11} />
                      {alert.detectedAt}
                    </span>
                    {alert.status === 'ACKNOWLEDGED' && (
                      <span className="font-mono text-[0.62rem] px-2 py-0.5 rounded bg-graphite/40 text-bone-muted uppercase">
                        Acknowledged
                      </span>
                    )}
                  </div>

                  {/* Signal statement */}
                  <h3 className="font-display text-base md:text-lg text-bone font-medium leading-snug">
                    {alert.signal}
                  </h3>

                  {/* Impact & Recommended Action Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 font-sans text-xs">
                    <div className="p-3 rounded-xl bg-obsidian-3/70 border border-silver/5 space-y-1">
                      <span className="mono-label text-silver-deep text-[0.65rem] block">
                        PROJECTED SYSTEM IMPACT
                      </span>
                      <p className="text-bone-2 text-[0.78rem] leading-relaxed">
                        {alert.impact}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-obsidian-3/70 border border-silver/5 space-y-1">
                      <span className="mono-label text-amber-300 text-[0.65rem] block">
                        RECOMMENDED NEXT INVESTIGATION
                      </span>
                      <p className="text-bone-2 text-[0.78rem] leading-relaxed">
                        {alert.recommendedAction}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right action controls */}
                <div className="flex md:flex-col items-center md:items-end gap-2 shrink-0 pt-2 md:pt-0">
                  <button
                    onClick={() => handleInvestigate(projectId)}
                    className="btn-aurum-primary text-xs !py-2 whitespace-nowrap"
                  >
                    <Sparkles size={13} />
                    <span>INVESTIGATE IN AI</span>
                  </button>

                  {alert.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleAcknowledge(projectId, alert.id)}
                      className="px-3 py-1.5 rounded-full bg-obsidian-3 hover:bg-obsidian-4 border border-silver/15 text-xs font-mono text-bone-muted hover:text-bone transition-colors flex items-center gap-1 whitespace-nowrap"
                    >
                      <CheckCircle2 size={13} />
                      <span>Acknowledge</span>
                    </button>
                  )}
                </div>
              </div>
            </AurumCard>
          ))
        )}
      </div>
    </div>
  );
};
