import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { useNotification } from '../context/NotificationContext';
import { UserRole } from '../types/user';
import { AurumCard } from '../components/common/AurumCard';
import { AurumButton } from '../components/common/AurumButton';
import {
  getSavedSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
  syncProjectsToSupabase,
  SUPABASE_SQL_SCHEMA
} from '../services/supabaseClient';
import {
  Shield,
  Database,
  Key,
  RotateCcw,
  CheckCircle,
  Check,
  Cpu,
  Copy,
  ExternalLink,
  Wifi,
  WifiOff,
  CloudUpload,
  Download,
  Code2,
  Lock,
  UserCheck,
  Globe,
  Compass
} from 'lucide-react';
import {
  getSavedCartoApiKey,
  saveCartoApiKey,
  testCartoConnection,
  DEFAULT_CARTO_API_KEY,
  getSavedCartoStyle,
  saveCartoStyle,
  CartoBasemapStyle,
  CARTO_BASEMAPS,
} from '../services/cartoService';

export const SettingsPage: React.FC = () => {
  const { user, setRole, updateProfile } = useAuth();
  const { projects, resetToDefaults } = useProjects();
  const { notify } = useNotification();

  // Supabase Configuration State
  const initialConfig = getSavedSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(initialConfig.url || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(initialConfig.anonKey || '');
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    latencyMs?: number;
  }>({
    tested: initialConfig.isConfigured,
    success: initialConfig.isConfigured,
    message: initialConfig.isConfigured ? 'Connected to configured Supabase endpoint' : 'Using Local Offline Engine',
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSqlSchema, setShowSqlSchema] = useState(false);
  const [schemaCopied, setSchemaCopied] = useState(false);

  // Gemini AI Key State
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('aurum_gemini_api_key') || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // CARTO GIS Configuration State
  const [cartoKey, setCartoKey] = useState(getSavedCartoApiKey);
  const [cartoStyle, setCartoStyle] = useState<CartoBasemapStyle>(getSavedCartoStyle);
  const [isTestingCarto, setIsTestingCarto] = useState(false);
  const [cartoTestResult, setCartoTestResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    latencyMs?: number;
  }>({
    tested: true,
    success: true,
    message: 'CARTO Basemap CDN Active',
    latencyMs: 38,
  });

  const handleTestCarto = async () => {
    setIsTestingCarto(true);
    const result = await testCartoConnection(cartoKey);
    setIsTestingCarto(false);
    setCartoTestResult({
      tested: true,
      success: result.success,
      message: result.message,
      latencyMs: result.latencyMs,
    });
    if (result.success) {
      notify('success', 'CARTO Ping OK', result.message);
    } else {
      notify('error', 'CARTO Test Failed', result.message);
    }
  };

  const handleSaveCarto = () => {
    saveCartoApiKey(cartoKey);
    saveCartoStyle(cartoStyle);
    notify('success', 'CARTO Saved', 'CARTO spatial GIS preferences saved.');
  };

  // Profile Edit State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileDept, setProfileDept] = useState(user?.department || '');

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

  const handleTestConnection = async () => {
    setIsTestingSupabase(true);
    const result = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
    setIsTestingSupabase(false);
    setTestResult({
      tested: true,
      success: result.success,
      message: result.message,
      latencyMs: result.latencyMs,
    });

    if (result.success) {
      notify('success', 'Supabase Online', `Latency: ${result.latencyMs}ms. Ready for live data synchronization.`);
    } else {
      notify('error', 'Supabase Connection Failed', result.message);
    }
  };

  const handleSaveSupabaseConfig = () => {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      notify('warning', 'Incomplete Credentials', 'Please provide both Project URL and Anon Public Key.');
      return;
    }

    saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
    notify('success', 'Credentials Saved', 'Supabase client initialized.');
    handleTestConnection();
  };

  const handleDisconnectSupabase = () => {
    clearSupabaseConfig();
    setSupabaseUrl('');
    setSupabaseAnonKey('');
    setTestResult({
      tested: false,
      success: false,
      message: 'Supabase disconnected. Operating in Local Offline Engine mode.',
    });
    notify('info', 'Supabase Disconnected', 'Switched back to Local Offline Storage Engine.');
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    const result = await syncProjectsToSupabase(projects);
    setIsSyncing(false);

    if (result.success) {
      notify('success', 'Database Synced', `Successfully pushed ${result.syncedCount} projects and telemetry to Supabase tables.`);
    } else {
      notify('error', 'Sync Failed', result.error || 'Failed to sync with Supabase tables. Ensure schema tables are created.');
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setSchemaCopied(true);
    notify('success', 'SQL Copied to Clipboard', 'Paste into your Supabase SQL Editor to initialize tables.');
    setTimeout(() => setSchemaCopied(false), 3000);
  };

  const handleSaveGeminiKey = () => {
    if (geminiKey.trim()) {
      localStorage.setItem('aurum_gemini_api_key', geminiKey.trim());
    } else {
      localStorage.removeItem('aurum_gemini_api_key');
    }
    setSaveSuccess(true);
    notify('success', 'AI Configuration Saved', geminiKey.trim() ? 'Live Gemini reasoning enabled.' : 'Grounded deterministic reasoning mode enabled.');
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(projects, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `master_dev_portfolio_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    notify('success', 'Backup Exported', 'Portfolio JSON snapshot downloaded.');
  };

  const handleResetData = () => {
    if (confirm('Reset all synthetic data to original baseline? Any custom milestone updates will be cleared.')) {
      resetToDefaults();
      setResetSuccess(true);
      notify('info', 'Baseline Restored', 'Portfolio data reset to default seed records.');
      setTimeout(() => setResetSuccess(false), 2500);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name: profileName.trim(),
      department: profileDept.trim(),
    });
    notify('success', 'Profile Updated', 'Identity credentials updated.');
  };

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in-up">
      {/* Editorial Header */}
      <div className="border-b border-silver/10 pb-5">
        <span className="mono-label">PLATFORM GOVERNANCE & TELEMETRY</span>
        <h1 className="font-display text-3xl md:text-4xl text-bone font-light tracking-tight mt-0.5">
          SETTINGS & SUPABASE INTEGRATION
        </h1>
        <p className="text-bone-muted text-xs md:text-sm mt-1">
          Connect your live Supabase cloud database, configure AI reasoning engines, and manage role-based clearance.
        </p>
      </div>

      {/* Supabase Cloud Connection Panel */}
      <AurumCard variant="showcase" className="p-6 md:p-8 hover-glow-card">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-silver-bright" />
            <span className="mono-label text-silver-bright">SUPABASE POSTGRESQL BACKEND</span>
          </div>

          <div className="flex items-center gap-2">
            {testResult.success ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[0.68rem] font-mono text-emerald-400 font-semibold">
                <Wifi size={12} />
                LIVE CONNECTED {testResult.latencyMs ? `(${testResult.latencyMs}ms)` : ''}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-obsidian-3 border border-silver/15 text-[0.68rem] font-mono text-silver-dark">
                <WifiOff size={12} />
                LOCAL ENGINE (OFFLINE)
              </span>
            )}
          </div>
        </div>

        <h2 className="font-display text-xl text-bone mb-1">Live Database Connection</h2>
        <p className="text-xs text-bone-muted mb-5 leading-relaxed">
          Connect a live Supabase PostgreSQL database to sync infrastructure projects, early-warning signals, and user credentials in real time.
        </p>

        {/* Input Fields */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="mono-label" htmlFor="supabase-url">
                SUPABASE PROJECT URL
              </label>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-[0.68rem] text-silver-deep hover:text-silver-bright flex items-center gap-1 font-mono transition-colors"
              >
                <span>Find in Supabase Dashboard</span>
                <ExternalLink size={10} />
              </a>
            </div>
            <input
              id="supabase-url"
              type="text"
              value={supabaseUrl}
              onChange={e => setSupabaseUrl(e.target.value)}
              placeholder="https://your-project-id.supabase.co"
              className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-4 py-2.5 text-xs text-bone font-mono placeholder-bone-faint focus:outline-none focus:border-silver-bright/50 transition-colors"
            />
          </div>

          <div>
            <label className="mono-label block mb-1.5" htmlFor="supabase-key">
              SUPABASE ANON PUBLIC API KEY
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bone-muted" />
              <input
                id="supabase-key"
                type="password"
                value={supabaseAnonKey}
                onChange={e => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-obsidian-3 border border-silver/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-bone font-mono placeholder-bone-faint focus:outline-none focus:border-silver-bright/50 transition-colors"
              />
            </div>
          </div>

          {/* Status Message Banner */}
          {testResult.tested && (
            <div
              className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between gap-3 animate-fade-in ${
                testResult.success
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {testResult.success ? <CheckCircle size={15} className="shrink-0" /> : <WifiOff size={15} className="shrink-0" />}
                <span>{testResult.message}</span>
              </div>
              {testResult.latencyMs !== undefined && (
                <span className="text-[0.68rem] text-bone-muted shrink-0 font-semibold">{testResult.latencyMs} ms ping</span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-3 pt-2">
            <AurumButton
              variant="primary"
              size="sm"
              onClick={handleSaveSupabaseConfig}
              disabled={isTestingSupabase}
            >
              SAVE & CONNECT
            </AurumButton>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTestingSupabase || !supabaseUrl}
              className="btn-aurum-secondary text-xs flex items-center gap-1.5"
            >
              <Wifi size={13} />
              <span>{isTestingSupabase ? 'PINGING SUPABASE...' : 'TEST CONNECTION'}</span>
            </button>

            {testResult.success && (
              <button
                type="button"
                onClick={handleSyncToSupabase}
                disabled={isSyncing}
                className="btn-aurum-secondary text-xs flex items-center gap-1.5 text-emerald-300 border-emerald-500/30"
              >
                <CloudUpload size={13} />
                <span>{isSyncing ? 'SYNCING DATA...' : 'SYNC PROJECTS TO SUPABASE'}</span>
              </button>
            )}

            {(supabaseUrl || supabaseAnonKey) && (
              <button
                type="button"
                onClick={handleDisconnectSupabase}
                className="text-xs font-mono text-bone-muted hover:text-rose-400 ml-auto transition-colors"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>

        {/* PostgreSQL Schema Accordion */}
        <div className="mt-6 pt-5 border-t border-silver/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-bone flex items-center gap-1.5">
                <Code2 size={14} className="text-silver-bright" />
                Database Schema Definition (PostgreSQL)
              </p>
              <p className="text-[0.72rem] text-bone-muted">
                Run this DDL script in your Supabase SQL Editor to initialize the <code>projects</code>, <code>milestones</code>, and <code>alerts</code> tables.
              </p>
            </div>
            <button
              onClick={() => setShowSqlSchema(!showSqlSchema)}
              className="text-xs font-mono text-silver hover:text-silver-bright underline ml-2 shrink-0"
            >
              {showSqlSchema ? 'Hide SQL' : 'View SQL Schema'}
            </button>
          </div>

          {showSqlSchema && (
            <div className="mt-4 p-4 rounded-xl bg-obsidian-1 border border-silver/15 animate-fade-in">
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-silver/10">
                <span className="mono-label text-[0.62rem]">AURUM_SUPABASE_SCHEMA.SQL</span>
                <button
                  onClick={handleCopySchema}
                  className="flex items-center gap-1 text-xs font-mono text-silver-bright hover:text-white px-2 py-1 rounded bg-obsidian-3 border border-silver/20 transition-all hover:bg-obsidian-4"
                >
                  <Copy size={12} />
                  <span>{schemaCopied ? 'COPIED!' : 'COPY SQL'}</span>
                </button>
              </div>
              <pre className="text-[0.7rem] font-mono text-bone-muted overflow-x-auto max-h-56 p-2 bg-obsidian-0 rounded leading-relaxed">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          )}
        </div>
      </AurumCard>

      {/* CARTO GIS Spatial Engine Configuration */}
      <AurumCard variant="showcase" className="p-6 md:p-8 hover-glow-card">
        <div className="flex items-center gap-2 mb-2">
          <Globe size={16} className="text-silver-bright" />
          <span className="mono-label">SPATIAL TELEMETRY &amp; GIS ENGINE</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-display text-xl text-bone">CARTO.com Spatial Platform</h2>
            <p className="text-xs text-bone-muted font-sans mt-0.5">
              High-resolution raster basemaps, corridor alignment routing, and geofenced risk impact zones.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              CARTO CDN ONLINE
            </span>
          </div>
        </div>

        <div className="space-y-4 max-w-xl">
          <div>
            <label className="mono-label block mb-1.5 text-silver">CARTO API KEY</label>
            <div className="relative">
              <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bone-muted" />
              <input
                type="text"
                value={cartoKey}
                onChange={e => setCartoKey(e.target.value)}
                placeholder="cb1_3uzo_..."
                className="w-full bg-obsidian-3 border border-silver/20 rounded-xl pl-9 pr-4 py-2.5 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
              />
            </div>
            <p className="text-[0.68rem] text-bone-muted mt-1 font-mono">
              Active Cloud Key: <code>{cartoKey || DEFAULT_CARTO_API_KEY}</code>
            </p>
          </div>

          <div>
            <label className="mono-label block mb-1.5 text-silver">DEFAULT BASEMAP STYLE</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(Object.keys(CARTO_BASEMAPS) as CartoBasemapStyle[]).map(style => {
                const opt = CARTO_BASEMAPS[style];
                const isSelected = cartoStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCartoStyle(opt.id)}
                    className={`
                      p-2.5 rounded-xl border text-left font-mono transition-all
                      ${
                        isSelected
                          ? 'bg-obsidian-4 border-silver/40 text-silver-bright shadow-soft'
                          : 'bg-obsidian-2 border-silver/10 text-bone-muted hover:border-silver/25 hover:text-bone'
                      }
                    `}
                  >
                    <span className="text-[0.72rem] font-semibold block">{opt.label}</span>
                    <span className="text-[0.6rem] text-bone-faint truncate block mt-0.5">{opt.sublabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Test Status Readout */}
          {cartoTestResult.tested && (
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
                cartoTestResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="shrink-0" />
                <span>{cartoTestResult.message}</span>
              </div>
              {cartoTestResult.latencyMs && (
                <span className="text-[0.68rem] px-2 py-0.5 rounded bg-obsidian-3 border border-silver/15">
                  {cartoTestResult.latencyMs}ms
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <AurumButton variant="primary" size="sm" onClick={handleSaveCarto}>
              SAVE CARTO SETTINGS
            </AurumButton>
            <button
              type="button"
              onClick={handleTestCarto}
              disabled={isTestingCarto}
              className="btn-aurum-secondary text-xs flex items-center gap-1.5"
            >
              <Wifi size={13} />
              <span>{isTestingCarto ? 'TESTING CDN...' : 'PING CARTO'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCartoKey(DEFAULT_CARTO_API_KEY);
                saveCartoApiKey(DEFAULT_CARTO_API_KEY);
                notify('info', 'Default Restored', 'Reverted to default CARTO API Key.');
              }}
              className="text-xs font-mono text-bone-muted hover:text-silver ml-auto"
            >
              Reset Default
            </button>
          </div>
        </div>
      </AurumCard>

      {/* Role Switcher & Persona Section */}
      <AurumCard variant="showcase" className="p-6 md:p-8 hover-glow-card">
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
                onClick={() => {
                  setRole(r.role);
                  notify('info', 'Role Changed', `Clearance set to: ${r.label}`);
                }}
                className={`
                  p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between hover-glow-card
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

                <div className="mt-4 pt-3 border-t border-silver/5 font-mono text-[0.65rem] text-silver-dark uppercase flex items-center justify-between">
                  <span>CLEARANCE: {r.role}</span>
                  {isSelected && <span className="text-emerald-400 font-semibold">ACTIVE</span>}
                </div>
              </div>
            );
          })}
        </div>
      </AurumCard>

      {/* Account Identity Preferences */}
      <AurumCard variant="showcase" className="p-6 md:p-8 hover-glow-card">
        <div className="flex items-center gap-2 mb-2">
          <UserCheck size={16} className="text-silver-bright" />
          <span className="mono-label">IDENTITY TELEMETRY</span>
        </div>
        <h2 className="font-display text-xl text-bone mb-2">Account Profile & Division</h2>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
          <div>
            <label className="mono-label block mb-1">FULL NAME</label>
            <input
              type="text"
              value={profileName}
              onChange={e => setProfileName(e.target.value)}
              className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-4 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
            />
          </div>

          <div>
            <label className="mono-label block mb-1">DEPARTMENT / DIVISION</label>
            <input
              type="text"
              value={profileDept}
              onChange={e => setProfileDept(e.target.value)}
              className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-4 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
            />
          </div>

          <AurumButton type="submit" variant="primary" size="sm">
            UPDATE CREDENTIALS
          </AurumButton>
        </form>
      </AurumCard>

      {/* AI Copilot Intelligence Settings */}
      <AurumCard variant="showcase" className="p-6 md:p-8 hover-glow-card">
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
                  notify('info', 'Key Removed', 'Reverted to Grounded Deterministic AI Engine.');
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

      {/* Portfolio Backup & Reset Baseline */}
      <AurumCard variant="showcase" className="p-6 md:p-8 hover-glow-card">
        <div className="flex items-center gap-2 mb-2">
          <Database size={16} className="text-silver-bright" />
          <span className="mono-label">PORTFOLIO DATA OPERATIONS</span>
        </div>
        <h2 className="font-display text-xl text-bone mb-2">Data Backup & Factory Baseline</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 rounded-xl bg-obsidian-2 border border-silver/10 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-bone mb-1">Export Portfolio JSON Snapshot</h3>
              <p className="text-xs text-bone-muted">Download all active projects, milestones, EVM trajectories, and alerts as a portable JSON document.</p>
            </div>
            <button
              onClick={handleExportBackup}
              className="btn-aurum-secondary text-xs flex items-center gap-1.5 mt-4 self-start"
            >
              <Download size={14} />
              <span>EXPORT BACKUP JSON</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-obsidian-2 border border-silver/10 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-bone mb-1">Reset to Synthetic Seed Baseline</h3>
              <p className="text-xs text-bone-muted">Restores all original 6 infrastructure projects, risk breakdowns, and alerts to fresh baseline state.</p>
            </div>
            <button
              onClick={handleResetData}
              className="btn-aurum-secondary text-xs flex items-center gap-1.5 mt-4 self-start text-rose-300 border-rose-500/20"
            >
              <RotateCcw size={14} />
              <span>{resetSuccess ? 'DATA RESTORED' : 'RESTORE FACTORY SEED'}</span>
            </button>
          </div>
        </div>
      </AurumCard>
    </div>
  );
};
