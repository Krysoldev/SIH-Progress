import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/user';
import { AurumAtmosphere } from '../components/common/AurumAtmosphere';
import { AurumButton } from '../components/common/AurumButton';
import { AurumCard } from '../components/common/AurumCard';
import { Lock, Mail, ArrowRight, ShieldCheck, Zap, User, Briefcase, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { getSupabaseStatus } from '../services/supabaseClient';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login, signup, loginAsRole, authError } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('rajesh.nair@masterdev.infra');
  const [signInPassword, setSignInPassword] = useState('DirectorPass2026!');
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('PROJECT_DIRECTOR');
  const [regDepartment, setRegDepartment] = useState('National Infrastructure Taskforce');

  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const supabaseStatus = getSupabaseStatus();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const result = await login(signInEmail, signInPassword);
    setIsLoading(false);

    if (result.success) {
      onLoginSuccess();
    } else {
      setLocalError(result.error || 'Authentication failed. Please check credentials.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const result = await signup({
      name: regName,
      email: regEmail,
      password: regPassword,
      role: regRole,
      department: regDepartment,
    });

    setIsLoading(false);

    if (result.success) {
      setSuccessMsg('Account provisioned successfully. Entering console...');
      setTimeout(() => {
        onLoginSuccess();
      }, 800);
    } else {
      setLocalError(result.error || 'Failed to create account. Please check inputs.');
    }
  };

  const handleQuickRole = (role: UserRole) => {
    loginAsRole(role);
    onLoginSuccess();
  };

  return (
    <div className="relative min-h-screen bg-obsidian-0 flex items-center justify-center p-4 selection:bg-silver-deep/30">
      {/* Ambient Aurum Lighting: Dual slow-drift radial glows + SVG grain */}
      <AurumAtmosphere />

      {/* Main Centered Login Panel */}
      <div className="relative z-10 w-full max-w-lg my-8 animate-fade-in-up">
        <AurumCard variant="showcase" className="p-7 md:p-9 border-silver/20 bg-obsidian-2/90 shadow-deep">
          {/* Brand Mark & Title */}
          <div className="text-center mb-6">
            <div className="inline-flex w-12 h-12 rounded-full border border-silver/40 bg-gradient-to-br from-silver-bright via-silver to-silver-dark items-center justify-center shadow-silver-glow mb-3">
              <div className="w-6 h-6 rounded-full bg-obsidian-1 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-silver-bright animate-pulse" />
              </div>
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-light tracking-tight text-bone">
              MASTER <span className="text-silver italic">DEV</span>
            </h1>
            <p className="font-mono text-[0.68rem] tracking-widest text-silver-dark uppercase mt-1">
              AI-POWERED PROJECT INTELLIGENCE & EARLY-WARNING PLATFORM
            </p>
          </div>

          {/* Tab Selector: Sign In vs Sign Up */}
          <div className="grid grid-cols-2 p-1 bg-obsidian-3/80 rounded-xl border border-silver/10 mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setLocalError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-mono font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'signin'
                  ? 'bg-silver text-obsidian-0 shadow-sm font-semibold'
                  : 'text-bone-muted hover:text-bone'
              }`}
            >
              SIGN IN
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setLocalError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-mono font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'signup'
                  ? 'bg-silver text-obsidian-0 shadow-sm font-semibold'
                  : 'text-bone-muted hover:text-bone'
              }`}
            >
              CREATE ACCOUNT
            </button>
          </div>

          {/* Feedback Messages */}
          {(localError || authError) && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-slide-in-right">
              <AlertCircle size={15} className="shrink-0 text-rose-400" />
              <span>{localError || authError}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-slide-in-right">
              <CheckCircle size={15} className="shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Sign In Form */}
          {activeTab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4 animate-fade-in">
              <div>
                <label className="mono-label block mb-1.5" htmlFor="email-input">
                  DIRECTOR EMAIL / IDENTITY
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bone-muted" />
                  <input
                    id="email-input"
                    type="email"
                    required
                    value={signInEmail}
                    onChange={e => setSignInEmail(e.target.value)}
                    placeholder="name@organization.gov / infra"
                    className="w-full bg-obsidian-3/90 border border-silver/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-bone font-mono placeholder-bone-faint focus:outline-none focus:border-silver-bright/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="mono-label" htmlFor="password-input">
                    ACCESS KEY / PASSWORD
                  </label>
                  <span className="text-[0.65rem] text-bone-faint font-mono">
                    Supabase Auth Supported
                  </span>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bone-muted" />
                  <input
                    id="password-input"
                    type="password"
                    required
                    value={signInPassword}
                    onChange={e => setSignInPassword(e.target.value)}
                    placeholder="Enter security key"
                    className="w-full bg-obsidian-3/90 border border-silver/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-bone font-mono placeholder-bone-faint focus:outline-none focus:border-silver-bright/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-bone-muted">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="accent-silver rounded"
                  />
                  <span>Remember session credentials</span>
                </label>
              </div>

              <AurumButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-3 !py-3 font-semibold shadow-silver-glow"
                disabled={isLoading}
                icon={<ArrowRight size={16} />}
              >
                {isLoading ? 'AUTHENTICATING TELEMETRY...' : 'SIGN IN TO CONSOLE'}
              </AurumButton>
            </form>
          ) : (
            /* Sign Up Form */
            <form onSubmit={handleSignUp} className="space-y-3.5 animate-fade-in">
              <div>
                <label className="mono-label block mb-1.5" htmlFor="reg-name">
                  FULL IDENTITY & TITLE
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bone-muted" />
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="e.g. Dr. Sunita Rao"
                    className="w-full bg-obsidian-3/90 border border-silver/20 rounded-xl pl-10 pr-4 py-2 text-xs text-bone font-mono placeholder-bone-faint focus:outline-none focus:border-silver-bright/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="mono-label block mb-1.5" htmlFor="reg-email">
                  ORGANIZATIONAL EMAIL
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bone-muted" />
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="sunita.rao@nhai.gov.in"
                    className="w-full bg-obsidian-3/90 border border-silver/20 rounded-xl pl-10 pr-4 py-2 text-xs text-bone font-mono placeholder-bone-faint focus:outline-none focus:border-silver-bright/50 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="mono-label block mb-1.5" htmlFor="reg-password">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bone-muted" />
                    <input
                      id="reg-password"
                      type="password"
                      required
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-obsidian-3/90 border border-silver/20 rounded-xl pl-10 pr-3 py-2 text-xs text-bone font-mono placeholder-bone-faint focus:outline-none focus:border-silver-bright/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="mono-label block mb-1.5" htmlFor="reg-role">
                    ROLE CLEARANCE
                  </label>
                  <select
                    id="reg-role"
                    value={regRole}
                    onChange={e => setRegRole(e.target.value as UserRole)}
                    className="w-full bg-obsidian-3/90 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50 transition-colors"
                  >
                    <option value="PROJECT_DIRECTOR">Project Director</option>
                    <option value="EXECUTIVE_CONTROLLER">Financial Controller</option>
                    <option value="SITE_SUPERVISOR">Site Resident Eng.</option>
                    <option value="LEAD_RISK_ANALYST">AI Risk Analyst</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mono-label block mb-1.5" htmlFor="reg-dept">
                  DIVISION / DEPARTMENT
                </label>
                <div className="relative">
                  <Briefcase size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bone-muted" />
                  <input
                    id="reg-dept"
                    type="text"
                    value={regDepartment}
                    onChange={e => setRegDepartment(e.target.value)}
                    placeholder="e.g. Expressways & Bridges Division"
                    className="w-full bg-obsidian-3/90 border border-silver/20 rounded-xl pl-10 pr-4 py-2 text-xs text-bone font-mono placeholder-bone-faint focus:outline-none focus:border-silver-bright/50 transition-colors"
                  />
                </div>
              </div>

              <AurumButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-3 !py-2.5 font-semibold shadow-silver-glow"
                disabled={isLoading}
                icon={<ArrowRight size={16} />}
              >
                {isLoading ? 'REGISTERING IDENTITY...' : 'CREATE ACCOUNT & ENTER CONSOLE'}
              </AurumButton>
            </form>
          )}

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-5 border-t border-silver/10">
            <span className="mono-label block text-center mb-2.5 flex items-center justify-center gap-1.5 text-bone-faint">
              <Zap size={12} className="text-amber-400" />
              1-CLICK PERSONA FAST PASS
            </span>

            <div className="grid grid-cols-2 gap-2 text-[0.72rem] font-mono">
              <button
                type="button"
                onClick={() => handleQuickRole('PROJECT_DIRECTOR')}
                className="p-2 rounded-lg bg-obsidian-3 hover:bg-obsidian-4 border border-silver/10 hover:border-silver/30 text-bone text-left transition-all hover:-translate-y-0.5"
              >
                <div className="font-semibold text-bone">Director View</div>
                <div className="text-[0.62rem] text-bone-faint truncate">Rajesh Nair • NHAI</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('EXECUTIVE_CONTROLLER')}
                className="p-2 rounded-lg bg-obsidian-3 hover:bg-obsidian-4 border border-silver/10 hover:border-silver/30 text-bone text-left transition-all hover:-translate-y-0.5"
              >
                <div className="font-semibold text-bone">CFO Controller</div>
                <div className="text-[0.62rem] text-bone-faint truncate">Priya Sharma • EVM</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('SITE_SUPERVISOR')}
                className="p-2 rounded-lg bg-obsidian-3 hover:bg-obsidian-4 border border-silver/10 hover:border-silver/30 text-bone text-left transition-all hover:-translate-y-0.5"
              >
                <div className="font-semibold text-bone">Resident Eng.</div>
                <div className="text-[0.62rem] text-bone-faint truncate">Vikram Singh • Site</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('LEAD_RISK_ANALYST')}
                className="p-2 rounded-lg bg-obsidian-3 hover:bg-obsidian-4 border border-silver/10 hover:border-silver/30 text-bone text-left transition-all hover:-translate-y-0.5"
              >
                <div className="font-semibold text-bone">AI Risk Analyst</div>
                <div className="text-[0.62rem] text-bone-faint truncate">Dr. Arjun Mehta</div>
              </button>
            </div>
          </div>

          {/* Supabase backend status indicator */}
          <div className="mt-5 pt-4 border-t border-silver/10 flex items-center justify-between text-[0.65rem] font-mono text-bone-faint">
            <div className="flex items-center gap-1.5">
              <Database size={11} className={supabaseStatus.configured ? 'text-emerald-400' : 'text-silver'} />
              <span>
                BACKEND:{' '}
                {supabaseStatus.configured ? (
                  <span className="text-emerald-400 font-semibold">SUPABASE CLOUD</span>
                ) : (
                  <span className="text-silver-bright">LOCAL SECURE ENGINE</span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <ShieldCheck size={11} className="text-emerald-400" />
              <span>TLS 1.3 / EAL-4+</span>
            </div>
          </div>
        </AurumCard>
      </div>
    </div>
  );
};
