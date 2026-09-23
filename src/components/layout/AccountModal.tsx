import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { UserRole } from '../../types/user';
import { AurumModal } from '../common/AurumModal';
import { AurumButton } from '../common/AurumButton';
import { getSupabaseStatus } from '../../services/supabaseClient';
import {
  User,
  ShieldCheck,
  Briefcase,
  Mail,
  LogOut,
  Save,
  Database,
  CheckCircle2,
  Users
} from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onLogout }) => {
  const { user, savedAccounts, switchAccount, updateProfile, setRole } = useAuth();
  const { notify } = useNotification();

  const [editName, setEditName] = useState(user?.name || '');
  const [editTitle, setEditTitle] = useState(user?.title || '');
  const [editDepartment, setEditDepartment] = useState(user?.department || '');
  const [activeTab, setActiveTab] = useState<'profile' | 'switch'>('profile');
  const [isSaving, setIsSaving] = useState(false);

  const supabaseStatus = getSupabaseStatus();

  // Keep form in sync when user changes
  React.useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditTitle(user.title);
      setEditDepartment(user.department);
    }
  }, [user]);

  if (!user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile({
      name: editName.trim(),
      title: editTitle.trim(),
      department: editDepartment.trim(),
    });
    setIsSaving(false);
    notify('success', 'Profile Updated', 'Identity and division telemetry saved successfully.');
  };

  const handleSwitch = (account: typeof user) => {
    switchAccount(account);
    notify('info', 'Identity Switched', `Active clearance set to: ${account.name} (${account.role})`);
    onClose();
  };

  return (
    <AurumModal isOpen={isOpen} onClose={onClose} title="ACCOUNT IDENTITY & CLEARANCE" maxWidth="lg">
      <div className="space-y-5">
        {/* User Identity Header Card */}
        <div className="p-4 rounded-xl bg-obsidian-3/80 border border-silver/15 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-silver-bright via-silver to-silver-dark p-0.5 shadow-silver-glow flex-shrink-0">
              <div className="w-full h-full rounded-full bg-obsidian-1 flex items-center justify-center font-mono font-bold text-silver-bright text-sm">
                {user.avatarInitials}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-bone text-sm">{user.name}</h3>
              <p className="text-xs text-bone-muted">{user.title}</p>
              <p className="font-mono text-[0.68rem] text-silver-dark flex items-center gap-1 mt-0.5">
                <Mail size={11} /> {user.email}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono text-[0.62rem] px-2.5 py-1 rounded-full bg-obsidian-4 border border-silver/20 text-silver tracking-wider uppercase inline-block">
              {user.role.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Supabase Status Pill */}
        <div className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-obsidian-2/90 border border-silver/10 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Database size={13} className={supabaseStatus.configured ? 'text-emerald-400' : 'text-silver'} />
            <span className="text-bone-muted">SUPABASE BACKEND:</span>
            <span className={supabaseStatus.configured ? 'text-emerald-400 font-semibold' : 'text-silver-bright'}>
              {supabaseStatus.configured ? 'LIVE CONNECTED' : 'LOCAL ENGINE'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[0.68rem] text-emerald-400">
            <ShieldCheck size={12} />
            <span>SESSION VALID</span>
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="grid grid-cols-2 p-1 bg-obsidian-3/80 rounded-xl border border-silver/10">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-1.5 text-xs font-mono rounded-lg transition-all ${
              activeTab === 'profile' ? 'bg-silver text-obsidian-0 font-semibold' : 'text-bone-muted hover:text-bone'
            }`}
          >
            EDIT IDENTITY
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('switch')}
            className={`py-1.5 text-xs font-mono rounded-lg transition-all ${
              activeTab === 'switch' ? 'bg-silver text-obsidian-0 font-semibold' : 'text-bone-muted hover:text-bone'
            }`}
          >
            SWITCH PERSONA ({savedAccounts.length})
          </button>
        </div>

        {/* Tab 1: Edit Profile */}
        {activeTab === 'profile' ? (
          <form onSubmit={handleSaveProfile} className="space-y-3.5 animate-fade-in">
            <div>
              <label className="mono-label block mb-1">FULL NAME & HONORIFIC</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bone-muted" />
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-obsidian-3/90 border border-silver/20 rounded-xl pl-9 pr-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
                />
              </div>
            </div>

            <div>
              <label className="mono-label block mb-1">OFFICIAL TITLE / POSITION</label>
              <div className="relative">
                <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bone-muted" />
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full bg-obsidian-3/90 border border-silver/20 rounded-xl pl-9 pr-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
                />
              </div>
            </div>

            <div>
              <label className="mono-label block mb-1">DEPARTMENT / DIVISION</label>
              <input
                type="text"
                required
                value={editDepartment}
                onChange={e => setEditDepartment(e.target.value)}
                className="w-full bg-obsidian-3/90 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
              />
            </div>

            <div>
              <label className="mono-label block mb-1">ROLE CLEARANCE LEVEL</label>
              <select
                value={user.role}
                onChange={e => {
                  setRole(e.target.value as UserRole);
                  notify('info', 'Role Updated', `Switched clearance to ${e.target.value}`);
                }}
                className="w-full bg-obsidian-3/90 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
              >
                <option value="PROJECT_DIRECTOR">Project Director (Portfolio Overview)</option>
                <option value="EXECUTIVE_CONTROLLER">Executive Financial Controller (EVM & Audit)</option>
                <option value="SITE_SUPERVISOR">Site Supervisor / Resident Engineer</option>
                <option value="LEAD_RISK_ANALYST">Lead AI Risk Analyst (Predictive Warnings)</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <AurumButton
                type="submit"
                variant="primary"
                size="md"
                disabled={isSaving}
                icon={<Save size={14} />}
              >
                {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
              </AurumButton>

              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 text-xs font-mono transition-colors"
              >
                <LogOut size={13} />
                <span>SIGN OUT</span>
              </button>
            </div>
          </form>
        ) : (
          /* Tab 2: Switch Persona */
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 animate-fade-in">
            <span className="mono-label block mb-1 flex items-center gap-1.5 text-bone-muted">
              <Users size={12} />
              SELECT AN ACTIVE PERSONA OR REGISTERED IDENTITY
            </span>

            {savedAccounts.map(acc => {
              const isCurrent = acc.id === user.id || acc.email.toLowerCase() === user.email.toLowerCase();
              return (
                <button
                  key={acc.id}
                  onClick={() => handleSwitch(acc)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all hover:-translate-y-0.5 ${
                    isCurrent
                      ? 'bg-obsidian-4 border-silver-bright/40 shadow-sm'
                      : 'bg-obsidian-3/70 hover:bg-obsidian-3 border-silver/10 hover:border-silver/25'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="w-8 h-8 rounded-full bg-obsidian-2 border border-silver/20 flex items-center justify-center text-xs font-mono font-bold text-silver-bright shrink-0">
                      {acc.avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-bone truncate">{acc.name}</div>
                      <div className="text-[0.68rem] text-bone-muted truncate">{acc.title}</div>
                      <div className="text-[0.62rem] font-mono text-silver-dark truncate">{acc.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[0.62rem] px-2 py-0.5 rounded-md bg-obsidian-2 border border-silver/15 text-silver uppercase">
                      {acc.role.replace(/_/g, ' ')}
                    </span>
                    {isCurrent && <CheckCircle2 size={15} className="text-emerald-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </AurumModal>
  );
};
