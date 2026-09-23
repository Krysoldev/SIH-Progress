import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/user';
import { AurumAtmosphere } from '../components/common/AurumAtmosphere';
import { AurumButton } from '../components/common/AurumButton';
import { AurumCard } from '../components/common/AurumCard';
import { Lock, Mail, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login, loginAsRole } = useAuth();
  const [email, setEmail] = useState('rajesh.nair@masterdev.infra');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await login(email, password);
    setIsLoading(false);
    onLoginSuccess();
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
      <div className="relative z-10 w-full max-w-md my-8">
        <AurumCard variant="showcase" className="p-8 md:p-10 border-silver/20 bg-obsidian-2/90 shadow-deep">
          {/* Brand Mark & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex w-12 h-12 rounded-full border border-silver/40 bg-gradient-to-br from-silver-bright via-silver to-silver-dark items-center justify-center shadow-silver-glow mb-4">
              <div className="w-6 h-6 rounded-full bg-obsidian-1 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-silver-bright" />
              </div>
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-light tracking-tight text-bone">
              MASTER <span className="text-silver italic">DEV</span>
            </h1>
            <p className="font-mono text-[0.68rem] tracking-widest text-silver-dark uppercase mt-1">
              PROJECT INTELLIGENCE PLATFORM
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-obsidian-3/90 border border-silver/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-bone font-mono placeholder-bone-faint focus:outline-none focus:border-silver-bright/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="mono-label" htmlFor="password-input">
                  ACCESS KEY / PASSWORD
                </label>
                <button
                  type="button"
                  onClick={() => alert('Demo Mode: Any password accepted. Or use 1-click role logins below.')}
                  className="text-[0.68rem] text-bone-muted hover:text-silver-bright font-sans transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bone-muted" />
                <input
                  id="password-input"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
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
              className="w-full mt-4 !py-3 font-semibold shadow-silver-glow"
              disabled={isLoading}
              icon={<ArrowRight size={16} />}
            >
              {isLoading ? 'AUTHENTICATING TELEMETRY...' : 'SIGN IN TO CONSOLE'}
            </AurumButton>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-8 pt-6 border-t border-silver/10">
            <span className="mono-label block text-center mb-3 flex items-center justify-center gap-1.5 text-bone-faint">
              <Zap size={12} className="text-amber-400" />
              1-CLICK DEMO EVALUATION LOGINS
            </span>

            <div className="grid grid-cols-2 gap-2 text-[0.72rem] font-mono">
              <button
                type="button"
                onClick={() => handleQuickRole('PROJECT_DIRECTOR')}
                className="p-2 rounded-lg bg-obsidian-3 hover:bg-obsidian-4 border border-silver/10 hover:border-silver/30 text-bone text-left transition-all truncate"
              >
                Director View
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('EXECUTIVE_CONTROLLER')}
                className="p-2 rounded-lg bg-obsidian-3 hover:bg-obsidian-4 border border-silver/10 hover:border-silver/30 text-bone text-left transition-all truncate"
              >
                Financial Controller
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('SITE_SUPERVISOR')}
                className="p-2 rounded-lg bg-obsidian-3 hover:bg-obsidian-4 border border-silver/10 hover:border-silver/30 text-bone text-left transition-all truncate"
              >
                Site Resident Eng.
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('LEAD_RISK_ANALYST')}
                className="p-2 rounded-lg bg-obsidian-3 hover:bg-obsidian-4 border border-silver/10 hover:border-silver/30 text-bone text-left transition-all truncate"
              >
                AI Risk Analyst
              </button>
            </div>
          </div>

          {/* Security badge */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[0.65rem] font-mono text-bone-faint">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>ENCRYPTED INFRASTRUCTURE ACCESS LAYER</span>
          </div>
        </AurumCard>
      </div>
    </div>
  );
};
