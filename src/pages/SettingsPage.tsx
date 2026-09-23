import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { UserRole } from '../types/user';
import { AurumCard } from '../components/common/AurumCard';
import { AurumButton } from '../components/common/AurumButton';
import { getSupabaseStatus } from '../services/supabaseClient';
import {
  User,
  Shield,
  Database,
  Key,
  RotateCcw,
  CheckCircle,
  Check,
  Cpu,
  Layers,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, setRole } = useAuth();
  const { resetToDefaults } = useProjects();
  const supabaseStatus = getSupabaseStatus();

  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('aurum_gemini_api_key') || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const roles: { role: UserRole; label: string; desc: string }[] = [
    {
      role: 'PROJECT_DIRECTOR',
      label: 'Chief Project Director',
      desc: 'Full portfolio oversight, strategic decision authorizations, and formal executive report sign-offs.',
    },
    {
      role: 'EXECUTIVE_CONTROLLER',
      label: 'Executive Financial Controller',
      desc: 'EVM audit, Cost Performance Index (CPI), budget variance analysis, and cash flow forecasting.',
    },
    {
      role: 'SITE_SUPERVISOR',
      label: 'Senior Resident Engineer',
      desc: 'Physical S-curve tracking, critical-path milestone stage-gates, and field contractor coordination.',
    },
    {
      role: 'LEAD_RISK_ANALYST',
      label: 'Lead Risk Intelligence Officer',
      desc: 'AI predictive modeling (XGBoost), early-warning anomaly tuning, and Monte Carlo scenario analysis.',
    },
  ];

  const handleSaveGeminiKey = () => {
    if (geminiKey.trim()) {
      localStorage.setItem('aurum_gemini_api_key', geminiKey.trim());
    } else {
      localStorage.removeItem('aurum_gemini_api_key');
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetData = () => {
    if (confirm('Reset all synthetic data to original baseline?')) {
      resetToDefaults();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2500);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-200">
      {/* Editorial Header */}
      <div className="border-b border-silver/10 pb-5">
        <span className="mono-label">PLATFORM GOVERNANCE & PREFERENCES</span>
        <h1 className="font-display text-3xl md:text-4xl text-bone font-light tracking-tight mt-0.5">
          SETTINGS & ROLE MANAGEMENT
        </h1>
        <p className="text-bone-muted text-xs md:text-sm mt-1">
          Role-based view permissions, database integration parameters, and AI model configurations.
        </p>
      </div>

      {/* Role Switcher Section */}
      <AurumCard variant="showcase" className="p-6 md:p-8">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={16} className="text-silver-bright" />
          <span className="mono-label">ACTIVE ROLE-BASED ACCESS CONTROL (RBAC)</span>
        </div>
        <h2 className="font-display text-xl text-bone mb-2">Switch Active Persona</h2>
        <p className="text-xs text-bone-muted mb-6 font-sans">
          Selecting a role updates your platform perspective, authority level, and dashboard metric emphasis.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map(r => {
            const isSelected = user?.role === r.role;
            return (
              <div
                key={r.role}
                onClick={() => setRole(r.role)}
                className={`
                  p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between
                  ${
                    isSelected
                      ? 'bg-obsidian-3 border-silver/40 shadow-soft'
                      : 'bg-obsidian-2/70 border-silver/10 hover:border-silver/20 hover:bg-obsidian-3/40'
                  }
                `}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h3 className="text-sm font-semibold text-bone">{r.label}</h3>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-silver-bright text-obsidian-0 flex items-center justify-center text-xs">
                        <Check size={12} />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-bone-muted leading-relaxed font-sans">
                    {r.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-silver/5 font-mono text-[0.65rem] text-silver-dark uppercase">
                  ROLE CODE: {r.role}
                </div>
              </div>
            );
          })}
        </div>
      </AurumCard>

      {/* Supabase & Data Engine Section */}
      <AurumCard variant="showcase" className="p-6 md:p-8">
        <div className="flex items-center gap-2 mb-2">
          <Database size={16} className="text-silver-bright" />
          <span className="mono-label">DATABASE & STORAGE TELEMETRY</span>
        </div>
        <h2 className="font-display text-xl text-bone mb-2">Data Engine Status</h2>

        <div className="p-4 rounded-xl bg-obsidian-3/80 border border-silver/10 space-y-3 font-mono text-xs mb-6">
          <div className="flex justify-between items-center">
            <span className="text-bone-muted">DATABASE MODE:</span>
            <span className="text-silver-bright font-semibold">
              {supabaseStatus.configured ? 'SUPABASE POSTGRESQL' : 'SYNTHETIC INTELLIGENCE (OFFLINE)'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-bone-muted">ENDPOINT URL:</span>
            <span className="text-bone truncate max-w-[280px]">{supabaseStatus.url}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-bone-muted">DATA INTEGRITY:</span>
            <span className="text-emerald-300 flex items-center gap-1">
              <CheckCircle size={13} />
              HEALTHY & SYNCHRONIZED
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-silver/10">
          <div>
            <p className="text-xs font-semibold text-bone">Reset Synthetic Data</p>
            <p className="text-xs text-bone-muted">Reverts any milestone or progress changes back to baseline seed data.</p>
          </div>
          <button
            onClick={handleResetData}
            className="btn-aurum-secondary text-xs flex items-center gap-1.5"
          >
            <RotateCcw size={14} />
            <span>{resetSuccess ? 'DATA RESTORED' : 'RESTORE DEFAULTS'}</span>
          </button>
        </div>
      </AurumCard>

      {/* AI Copilot Intelligence Settings */}
      <AurumCard variant="showcase" className="p-6 md:p-8">
        <div className="flex items-center gap-2 mb-2">
          <Cpu size={16} className="text-silver-bright" />
          <span className="mono-label">COGNITIVE ENGINE CONFIGURATION</span>
        </div>
        <h2 className="font-display text-xl text-bone mb-2">AI Copilot Parameters</h2>
        <p className="text-xs text-bone-muted mb-4 font-sans">
          The system operates deterministically by default. You may optionally supply a Google Gemini API key to run live multimodal queries.
        </p>

        <div className="space-y-3 max-w-lg">
          <label className="mono-label block text-silver">GOOGLE GEMINI API KEY</label>
          <div className="relative">
            <Key size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bone-muted" />
            <input
              type="password"
              value={geminiKey}
              onChange={e => setGeminiKey(e.target.value)}
              placeholder="AIzaSy... (Leave empty for Grounded Deterministic Mode)"
              className="w-full bg-obsidian-3 border border-silver/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-bone font-mono placeholder-bone-faint focus:outline-none focus:border-silver-bright/50"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <AurumButton
              variant="primary"
              size="sm"
              onClick={handleSaveGeminiKey}
            >
              {saveSuccess ? 'CONFIG SAVED' : 'SAVE AI PREFERENCES'}
            </AurumButton>
            {geminiKey && (
              <button
                type="button"
                onClick={() => {
                  setGeminiKey('');
                  localStorage.removeItem('aurum_gemini_api_key');
                  setSaveSuccess(true);
                  setTimeout(() => setSaveSuccess(false), 2000);
                }}
                className="text-xs font-mono text-bone-muted hover:text-red-300"
              >
                Clear Key
              </button>
            )}
          </div>
        </div>
      </AurumCard>
    </div>
  );
};
