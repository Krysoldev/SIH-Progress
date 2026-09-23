import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { AurumCard } from '../components/common/AurumCard';
import { AurumButton } from '../components/common/AurumButton';
import { AurumBadge } from '../components/common/AurumBadge';
import { FileText, Download, Printer, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';

export const ReportsPage: React.FC<ReportsPageProps> = () => {
  const { projects, selectedProject, setSelectedProject, summary } = useProjects();
  const { user } = useAuth();

  const [reportType, setReportType] = useState<'executive' | 'risk' | 'financial'>('executive');
  const [scope, setScope] = useState<'single' | 'portfolio'>('single');

  const p = selectedProject;

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-silver/10 pb-5">
        <div>
          <span className="mono-label">AUDIT & EXECUTIVE REPORT GENERATOR</span>
          <h1 className="font-display text-3xl md:text-4xl text-bone font-light tracking-tight mt-0.5">
            PROJECT INTELLIGENCE REPORTS
          </h1>
          <p className="text-bone-muted text-xs md:text-sm mt-1">
            Generate formal risk briefings, EVM audits, and AI early-warning digests.
          </p>
        </div>

        <AurumButton
          variant="primary"
          onClick={handleDownload}
          icon={<Download size={15} />}
          className="text-xs"
        >
          DOWNLOAD / PRINT REPORT
        </AurumButton>
      </div>

      {/* Configuration Control Bar */}
      <div className="p-4 rounded-xl bg-obsidian-2/90 border border-silver/15 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        {/* Report Type */}
        <div className="flex items-center gap-2">
          <span className="text-bone-muted">TYPE:</span>
          <div className="inline-flex p-0.5 rounded-lg bg-obsidian-3 border border-silver/10">
            <button
              onClick={() => setReportType('executive')}
              className={`px-3 py-1.5 rounded-md transition-all ${reportType === 'executive' ? 'bg-silver-bright text-obsidian-0 font-semibold' : 'text-bone-muted hover:text-bone'}`}
            >
              Executive Summary
            </button>
            <button
              onClick={() => setReportType('risk')}
              className={`px-3 py-1.5 rounded-md transition-all ${reportType === 'risk' ? 'bg-silver-bright text-obsidian-0 font-semibold' : 'text-bone-muted hover:text-bone'}`}
            >
              Risk & Early-Warning Audit
            </button>
            <button
              onClick={() => setReportType('financial')}
              className={`px-3 py-1.5 rounded-md transition-all ${reportType === 'financial' ? 'bg-silver-bright text-obsidian-0 font-semibold' : 'text-bone-muted hover:text-bone'}`}
            >
              EVM Financial Audit
            </button>
          </div>
        </div>

        {/* Project Scope */}
        <div className="flex items-center gap-2">
          <span className="text-bone-muted">PROJECT:</span>
          <select
            value={p.id}
            onChange={e => {
              const found = projects.find(item => item.id === e.target.value);
              if (found) setSelectedProject(found);
            }}
            className="bg-obsidian-3 border border-silver/15 rounded-lg px-3 py-1.5 text-bone font-sans focus:outline-none focus:border-silver"
          >
            {projects.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Structured Document Preview Area */}
      <div className="bg-obsidian-1 border border-silver/20 rounded-showcase p-6 md:p-12 shadow-deep max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
        {/* Document Formal Header */}
        <div className="border-b-2 border-silver/20 pb-6 mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs text-silver-dark uppercase tracking-widest">
                OFFICIAL REPORT
              </span>
              <span className="text-silver-dark">•</span>
              <span className="font-mono text-xs text-silver font-bold">
                DOCUMENT REF: MD-REP-{p.code}-2026
              </span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl text-bone font-medium tracking-tight">
              {reportType === 'executive' && `Executive Intelligence Briefing: ${p.name}`}
              {reportType === 'risk' && `Early-Warning & Risk Audit: ${p.name}`}
              {reportType === 'financial' && `EVM Capital Performance Audit: ${p.name}`}
            </h2>
            <p className="font-mono text-xs text-bone-muted mt-1">
              Sector: {p.category} • Location: {p.location}
            </p>
          </div>

          <div className="text-right font-mono text-xs text-bone-muted space-y-1">
            <p className="text-silver-bright font-semibold">MASTER DEV PLATFORM</p>
            <p>AURUM INTELLIGENCE v1.2</p>
            <p>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Document Body Sections */}
        <div className="space-y-8 font-sans text-xs md:text-sm">
          {/* Section 1: Project Overview */}
          <section className="space-y-3">
            <h3 className="font-mono text-xs text-silver font-semibold uppercase tracking-wider border-b border-silver/10 pb-1">
              1. PROJECT OVERVIEW & STATUS CLASSIFICATION
            </h3>
            <p className="text-bone-2 leading-relaxed">
              {p.description} The asset is currently evaluated under{' '}
              <strong className="text-bone">{p.status}</strong> classification with an overall Composite Risk Score of{' '}
              <strong className="text-bone">{p.riskScore} / 100</strong>.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-obsidian-2/80 border border-silver/10 font-mono text-xs my-3">
              <div>
                <span className="text-bone-muted text-[0.68rem] block">PLANNED COST</span>
                <span className="text-bone font-bold">₹{p.plannedCost} Cr</span>
              </div>
              <div>
                <span className="text-bone-muted text-[0.68rem] block">EXPENDED COST</span>
                <span className="text-bone font-bold">₹{p.currentExpenditure} Cr</span>
              </div>
              <div>
                <span className="text-bone-muted text-[0.68rem] block">PHYSICAL PROGRESS</span>
                <span className="text-bone font-bold">{p.physicalProgress}%</span>
              </div>
              <div>
                <span className="text-bone-muted text-[0.68rem] block">ELAPSED MONTHS</span>
                <span className="text-bone font-bold">{p.elapsedDuration} / {p.plannedDuration}</span>
              </div>
            </div>
          </section>

          {/* Section 2: Cost & Schedule Status */}
          <section className="space-y-3">
            <h3 className="font-mono text-xs text-silver font-semibold uppercase tracking-wider border-b border-silver/10 pb-1">
              2. COST STATUS & SCHEDULE TRAJECTORY
            </h3>
            <p className="text-bone-2 leading-relaxed">
              Earned Value Management (EVM) parameters demonstrate a Cost Performance Index (CPI) of{' '}
              <strong className="text-bone">{p.evm.cpi}</strong> and a Schedule Performance Index (SPI) of{' '}
              <strong className="text-bone">{p.evm.spi}</strong>. The machine learning regression model projects a final cost variance of{' '}
              <strong className="text-red-300">₹{p.prediction.predictedCostOverrun} Cr</strong> beyond contractual ceiling (Estimate at Completion: ₹{p.evm.eac.toFixed(1)} Cr), and a schedule slippage of{' '}
              <strong className="text-amber-300">+{p.prediction.predictedTimeOverrun} months</strong>.
            </p>
          </section>

          {/* Section 3: Risk Breakdown */}
          <section className="space-y-3">
            <h3 className="font-mono text-xs text-silver font-semibold uppercase tracking-wider border-b border-silver/10 pb-1">
              3. DECOMPOSED RISK ATTRIBUTION
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-obsidian-2 border border-silver/10">
                <span className="text-bone-muted text-[0.65rem] block">SCHEDULE RISK</span>
                <span className="text-red-300 font-bold text-base">{p.riskBreakdown.scheduleRisk} / 100</span>
              </div>
              <div className="p-3 rounded-lg bg-obsidian-2 border border-silver/10">
                <span className="text-bone-muted text-[0.65rem] block">COST RISK</span>
                <span className="text-orange-300 font-bold text-base">{p.riskBreakdown.costRisk} / 100</span>
              </div>
              <div className="p-3 rounded-lg bg-obsidian-2 border border-silver/10">
                <span className="text-bone-muted text-[0.65rem] block">PROGRESS RISK</span>
                <span className="text-orange-300 font-bold text-base">{p.riskBreakdown.progressRisk} / 100</span>
              </div>
              <div className="p-3 rounded-lg bg-obsidian-2 border border-silver/10">
                <span className="text-bone-muted text-[0.65rem] block">MILESTONE RISK</span>
                <span className="text-amber-300 font-bold text-base">{p.riskBreakdown.milestoneRisk} / 100</span>
              </div>
            </div>

            <p className="text-bone-2 font-medium pt-2">Substantiated Root Causes:</p>
            <ul className="space-y-1.5 pl-2 text-bone-muted">
              {p.riskBreakdown.rootCauses.map((rc, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-silver-bright font-bold">•</span>
                  <span>{rc}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 4: Active Early Warnings */}
          <section className="space-y-3">
            <h3 className="font-mono text-xs text-silver font-semibold uppercase tracking-wider border-b border-silver/10 pb-1">
              4. ACTIVE EARLY WARNING SIGNALS ({p.alerts.length})
            </h3>
            <div className="space-y-2.5">
              {p.alerts.map(alt => (
                <div key={alt.id} className="p-3 rounded-lg bg-obsidian-2 border border-silver/10 space-y-1">
                  <div className="flex items-center justify-between font-mono text-[0.68rem]">
                    <span className="text-silver-bright font-semibold">{alt.alertType} WARNING • {alt.severity}</span>
                    <span className="text-bone-faint">{alt.detectedAt}</span>
                  </div>
                  <p className="text-bone font-medium text-xs">{alt.signal}</p>
                  <p className="text-bone-muted text-xs">Impact: {alt.impact}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5: AI Executive Recommendation */}
          <section className="space-y-3 pt-2">
            <h3 className="font-mono text-xs text-emerald-300 font-semibold uppercase tracking-wider border-b border-silver/10 pb-1">
              5. AI COPILOT INTERVENTION DIRECTIVE
            </h3>
            <div className="p-4 rounded-xl bg-obsidian-2/90 border border-silver/15 space-y-2">
              <p className="text-bone leading-relaxed">
                <strong>Executive Action Required:</strong> Execute an immediate tripartite engineering conference between Chief Project Director, Larsen & Infra Consortium, and Geotechnical Consultants. Reallocate ₹18 Cr contingency toward concurrent bridge segment casting, and fast-track right-of-way corridor clearances on Section 4 to recover 3 months of float before monsoon onset.
              </p>
            </div>
          </section>

          {/* Formal Signature Sign-off */}
          <div className="pt-8 border-t border-silver/10 flex items-center justify-between font-mono text-xs text-bone-muted">
            <div>
              <p className="text-bone font-semibold">{user?.name || 'Rajesh Nair'}</p>
              <p className="text-[0.68rem]">{user?.title || 'Chief Project Director'}</p>
              <p className="text-[0.65rem] text-bone-faint">Master Dev Platform Authority</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                <ShieldCheck size={15} />
                <span>CRYPTOGRAPHICALLY VERIFIED</span>
              </div>
              <p className="text-[0.65rem] text-bone-faint">SHA-256: 8f4a9b...3c1e</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ReportsPageProps {
  onNavigate?: (screen: any) => void;
}
