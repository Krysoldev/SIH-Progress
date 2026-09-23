import React, { useState, useEffect } from 'react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { ScreenId } from '../components/layout/AurumSidebar';
import { Project, ProjectStatus } from '../types/project';
import { UserRole } from '../types/user';
import { AurumCard } from '../components/common/AurumCard';
import { AurumBadge } from '../components/common/AurumBadge';
import { AurumModal } from '../components/common/AurumModal';
import { AurumButton } from '../components/common/AurumButton';
import {
  getSavedSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  syncProjectsToSupabase,
  fetchTableCountsFromSupabase,
  SUPABASE_SQL_SCHEMA
} from '../services/supabaseClient';
import {
  Server,
  Shield,
  Database,
  Users,
  FolderGit2,
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
  Copy,
  RotateCcw,
  Wifi,
  WifiOff,
  CloudUpload,
  Download,
  Key,
  Sliders,
  CheckCircle2,
  Search,
  ExternalLink,
  Code2,
  Activity,
  UserPlus,
  Eye,
  Check
} from 'lucide-react';

interface AdminPageProps {
  onNavigate: (screen: ScreenId) => void;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  category: 'AUTH' | 'CRUD' | 'SUPABASE' | 'EVM' | 'SYSTEM';
  actor: string;
  action: string;
  details: string;
}

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '2 mins ago',
    category: 'AUTH',
    actor: 'Rajesh Nair (Project Director)',
    action: 'Session Authentication',
    details: 'Console identity verified via secure TLS credentials.',
  },
  {
    id: 'log-2',
    timestamp: '8 mins ago',
    category: 'EVM',
    actor: 'Priya Sharma (CFO Controller)',
    action: 'EVM Re-computation',
    details: 'Highway Expansion Package 4 EAC calculated at ₹580 Cr.',
  },
  {
    id: 'log-3',
    timestamp: '22 mins ago',
    category: 'SUPABASE',
    actor: 'System Daemon',
    action: 'Cloud Telemetry Sync',
    details: 'Synchronized 6 project records and active signals with Supabase.',
  },
  {
    id: 'log-4',
    timestamp: '1 hour ago',
    category: 'CRUD',
    actor: 'Admin Console',
    action: 'Milestone Update',
    details: 'Stage-gate foundation piling marked IN_PROGRESS (+2m delay).',
  },
];

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { projects, setSelectedProject, createProject, updateProject, deleteProject, resetToDefaults, summary } = useProjects();
  const { user, savedAccounts, switchAccount, deleteCustomAccount, signup } = useAuth();
  const { notify } = useNotification();

  const [activeTab, setActiveTab] = useState<'projects' | 'users' | 'supabase' | 'thresholds' | 'audit'>('projects');

  // Supabase State
  const supabaseConfig = getSavedSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(supabaseConfig.url || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(supabaseConfig.anonKey || '');
  const [dbStatus, setDbStatus] = useState({
    tested: supabaseConfig.isConfigured,
    success: supabaseConfig.isConfigured,
    latencyMs: 0,
    message: supabaseConfig.isConfigured ? 'Connected to remote Supabase instance' : 'Operating in Local Storage Engine',
  });
  const [dbCounts, setDbCounts] = useState({ projectsCount: 0, alertsCount: 0, milestonesCount: 0 });
  const [isSyncingDb, setIsSyncingDb] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Project Management State
  const [projectSearch, setProjectSearch] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // New Project Form
  const [pName, setPName] = useState('');
  const [pCode, setPCode] = useState('');
  const [pCategory, setPCategory] = useState<Project['category']>('Highways & Expressways');
  const [pLocation, setPLocation] = useState('');
  const [pState, setPState] = useState('');
  const [pPlannedCost, setPPlannedCost] = useState('500');
  const [pDuration, setPDuration] = useState('36');
  const [pContractor, setPContractor] = useState('L&T Infrastructure');
  const [pManager, setPManager] = useState('Er. R. Sharma');

  // User Provisioning State
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('AdminPass2026!');
  const [newUserRole, setNewUserRole] = useState<UserRole>('PROJECT_DIRECTOR');
  const [newUserDept, setNewUserDept] = useState('Infrastructure Taskforce');

  // Thresholds State
  const [thresholds, setThresholds] = useState(() => {
    try {
      const stored = localStorage.getItem('aurum_system_thresholds');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      criticalRisk: 75,
      cpiWarning: 0.90,
      spiWarning: 0.92,
      milestoneDelayBuffer: 1.5,
    };
  });

  // Fetch Supabase counts if configured
  useEffect(() => {
    if (supabaseConfig.isConfigured) {
      fetchTableCountsFromSupabase().then(res => {
        if (!res.error) {
          setDbCounts({
            projectsCount: res.projectsCount,
            alertsCount: res.alertsCount,
            milestonesCount: res.milestonesCount,
          });
        }
      });
    }
  }, [supabaseConfig.isConfigured]);

  const addAuditLog = (category: AuditLogEntry['category'], action: string, details: string) => {
    const entry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      category,
      actor: user ? `${user.name} (${user.role.split('_')[0]})` : 'Administrator',
      action,
      details,
    };
    setAuditLogs(prev => [entry, ...prev.slice(0, 30)]);
  };

  // Test Supabase Connection
  const handleTestConnection = async () => {
    const result = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
    setDbStatus({
      tested: true,
      success: result.success,
      latencyMs: result.latencyMs,
      message: result.message,
    });

    if (result.success) {
      notify('success', 'Supabase Online', `Response time: ${result.latencyMs}ms. Ready for operations.`);
      addAuditLog('SUPABASE', 'Connection Verified', `Ping latency: ${result.latencyMs}ms.`);
      const counts = await fetchTableCountsFromSupabase();
      setDbCounts(counts);
    } else {
      notify('error', 'Supabase Connection Error', result.message);
      addAuditLog('SUPABASE', 'Connection Failed', result.message);
    }
  };

  const handleSaveSupabaseConfig = () => {
    saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
    notify('success', 'Configuration Saved', 'Supabase client credentials updated.');
    handleTestConnection();
  };

  const handleSyncToSupabase = async () => {
    setIsSyncingDb(true);
    const result = await syncProjectsToSupabase(projects);
    setIsSyncingDb(false);

    if (result.success) {
      notify('success', 'Database Synchronized', `Pushed ${result.syncedCount} projects and alerts to Supabase tables.`);
      addAuditLog('SUPABASE', 'Full Data Sync', `Upserted ${result.syncedCount} projects.`);
      const counts = await fetchTableCountsFromSupabase();
      setDbCounts(counts);
    } else {
      notify('error', 'Sync Failed', result.error || 'Check Supabase table permissions.');
    }
  };

  // Project CRUD Actions
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(pPlannedCost) || 500;
    const dur = parseInt(pDuration) || 36;
    const id = `proj-${Date.now().toString(36)}`;

    const newProj: Project = {
      id,
      code: pCode.trim().toUpperCase() || `PRJ-${Math.floor(Math.random() * 900 + 100)}`,
      name: pName.trim(),
      location: pLocation.trim() || 'Corridor, India',
      state: pState.trim() || 'Central',
      lat: 20.5937 + (Math.random() - 0.5) * 8,
      lng: 78.9629 + (Math.random() - 0.5) * 8,
      plannedCost: cost,
      currentExpenditure: Math.round(cost * 0.12),
      physicalProgress: 15,
      plannedDuration: dur,
      elapsedDuration: 4,
      status: 'ON TRACK',
      riskScore: 22,
      category: pCategory,
      contractor: pContractor.trim() || 'National EPC Partner',
      manager: pManager.trim() || 'Resident Engineer',
      lastUpdate: 'Just now',
      description: 'Newly registered asset under Master Dev intelligence monitoring.',
      riskBreakdown: {
        overallScore: 22,
        costRisk: 18,
        scheduleRisk: 20,
        progressRisk: 22,
        milestoneRisk: 15,
        riskLevel: 'LOW',
        rootCauses: ['Initial mobilization complete with standard telemetry.'],
      },
      evm: {
        pv: Math.round(cost * (4 / dur)),
        ev: Math.round(cost * 0.15),
        ac: Math.round(cost * 0.12),
        cv: Math.round(cost * 0.03),
        sv: Math.round(cost * 0.02),
        cpi: 1.08,
        spi: 1.03,
        eac: cost,
        vac: 0,
        tcpi: 0.96,
      },
      prediction: {
        predictedCostOverrun: 0,
        predictedTimeOverrun: 0,
        confidenceScore: 0.90,
        modelName: 'XGBoost-Infra-v2.4',
        lastUpdated: 'Just now',
      },
      milestones: [
        {
          id: `m-${id}-1`,
          projectId: id,
          name: 'Stage-Gate Clearances & Land Acquisition',
          plannedDate: 'Month 2',
          actualDate: 'Month 2',
          status: 'COMPLETED',
          criticalPath: true,
          delayMonths: 0,
          weightage: 25,
        },
        {
          id: `m-${id}-2`,
          projectId: id,
          name: 'Main Civil Foundation Works',
          plannedDate: 'Month 8',
          actualDate: null,
          status: 'IN_PROGRESS',
          criticalPath: true,
          delayMonths: 0,
          weightage: 35,
        },
      ],
      trajectory: [
        {
          monthIndex: 0,
          reportDate: 'Month 0',
          plannedProgress: 0,
          actualProgress: 0,
          plannedExpenditure: 0,
          actualExpenditure: 0,
        },
        {
          monthIndex: 4,
          reportDate: 'Month 4',
          plannedProgress: 12,
          actualProgress: 15,
          plannedExpenditure: Math.round(cost * 0.12),
          actualExpenditure: Math.round(cost * 0.12),
        },
      ],
      alerts: [],
    };

    await createProject(newProj);
    setIsCreateProjectOpen(false);
    notify('success', 'Asset Created', `${pName} registered and added to database.`);
    addAuditLog('CRUD', 'Asset Provisioned', `Created ${pName} (${pCode}) with ₹${cost} Cr BAC.`);
    setSelectedProject(newProj);
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (confirm(`Permanently delete infrastructure asset: "${name}"? This removes all milestones and alerts.`)) {
      await deleteProject(id);
      notify('info', 'Asset Deleted', `Removed ${name} from active inventory.`);
      addAuditLog('CRUD', 'Asset Deleted', `Removed ${name} (${id}) from database.`);
    }
  };

  const handleSaveEditedProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    await updateProject(editingProject);
    setEditingProject(null);
    notify('success', 'Project Updated', `Saved parameters for ${editingProject.name}.`);
    addAuditLog('CRUD', 'Asset Modified', `Updated metrics for ${editingProject.code}.`);
  };

  // User Provisioning Actions
  const handleProvisionUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signup({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      password: newUserPassword,
      role: newUserRole,
      department: newUserDept.trim(),
    });

    if (result.success) {
      setIsCreateUserOpen(false);
      notify('success', 'Officer Provisioned', `Account created for ${newUserName} (${newUserRole}).`);
      addAuditLog('AUTH', 'User Provisioned', `Created account for ${newUserName} <${newUserEmail}>.`);
      setNewUserName('');
      setNewUserEmail('');
    } else {
      notify('error', 'Provisioning Error', result.error || 'Failed to create user account.');
    }
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (confirm(`Remove clearance for officer: "${name}"?`)) {
      deleteCustomAccount(id);
      notify('info', 'Account Removed', `Revoked clearance for ${name}.`);
      addAuditLog('AUTH', 'Account Revoked', `Deleted account ${name} (${id}).`);
    }
  };

  // Thresholds
  const handleSaveThresholds = () => {
    localStorage.setItem('aurum_system_thresholds', JSON.stringify(thresholds));
    notify('success', 'Thresholds Saved', 'Updated early-warning anomaly parameters.');
    addAuditLog('SYSTEM', 'Thresholds Re-calibrated', `Critical risk: ${thresholds.criticalRisk}, CPI trigger: ${thresholds.cpiWarning}`);
  };

  const filteredProjects = projects.filter(p =>
    !projectSearch ||
    p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.code.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.location.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.contractor.toLowerCase().includes(projectSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-silver/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="mono-label">CENTRAL GOVERNANCE & TELEMETRY</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[0.68rem] text-bone-muted">ROOT CLEARANCE ENABLED</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-bone font-light tracking-tight">
            ADMIN & INFRASTRUCTURE CONSOLE
          </h1>
          <p className="text-bone-muted text-xs md:text-sm mt-1">
            Complete asset lifecycle management, cloud database operations, identity access management, and audit telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <AurumButton
            variant="primary"
            size="sm"
            onClick={() => setIsCreateProjectOpen(true)}
            icon={<Plus size={14} />}
          >
            CREATE ASSET
          </AurumButton>
          <button
            onClick={() => setIsCreateUserOpen(true)}
            className="btn-aurum-secondary text-xs flex items-center gap-1.5"
          >
            <UserPlus size={14} />
            <span>PROVISION OFFICER</span>
          </button>
        </div>
      </div>

      {/* Top 4 System Health Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Assets */}
        <AurumCard variant="showcase" className="p-4 md:p-5 flex flex-col justify-between hover-glow-card">
          <div className="flex justify-between items-center text-xs font-mono text-bone-muted">
            <span>ASSET INVENTORY</span>
            <FolderGit2 size={16} className="text-silver-bright" />
          </div>
          <div className="my-2">
            <span className="font-display text-3xl font-light text-bone">{projects.length}</span>
            <span className="font-mono text-xs text-bone-muted ml-1.5">Packages</span>
          </div>
          <div className="font-mono text-[0.68rem] text-silver truncate">
            ₹{summary.totalPlannedCost} Cr Committed Capital
          </div>
        </AurumCard>

        {/* Card 2: Identities */}
        <AurumCard variant="showcase" className="p-4 md:p-5 flex flex-col justify-between hover-glow-card">
          <div className="flex justify-between items-center text-xs font-mono text-bone-muted">
            <span>OFFICER IDENTITIES</span>
            <Users size={16} className="text-silver-bright" />
          </div>
          <div className="my-2">
            <span className="font-display text-3xl font-light text-bone">{savedAccounts.length}</span>
            <span className="font-mono text-xs text-bone-muted ml-1.5">Active IAM</span>
          </div>
          <div className="font-mono text-[0.68rem] text-emerald-400">
            RBAC Clearance Enforced
          </div>
        </AurumCard>

        {/* Card 3: Supabase */}
        <AurumCard variant="showcase" className="p-4 md:p-5 flex flex-col justify-between hover-glow-card">
          <div className="flex justify-between items-center text-xs font-mono text-bone-muted">
            <span>SUPABASE CLOUD</span>
            <Database size={16} className={dbStatus.success ? 'text-emerald-400' : 'text-silver'} />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="font-display text-xl font-light text-bone">
              {dbStatus.success ? 'ONLINE' : 'LOCAL ENGINE'}
            </span>
            {dbStatus.latencyMs > 0 && (
              <span className="font-mono text-xs text-emerald-400 font-semibold">{dbStatus.latencyMs}ms</span>
            )}
          </div>
          <div className="font-mono text-[0.68rem] text-silver truncate">
            {dbStatus.success ? `${dbCounts.projectsCount} remote projects synced` : 'Offline storage active'}
          </div>
        </AurumCard>

        {/* Card 4: Critical Warnings */}
        <AurumCard variant="showcase" className="p-4 md:p-5 flex flex-col justify-between hover-glow-card">
          <div className="flex justify-between items-center text-xs font-mono text-bone-muted">
            <span>CRITICAL WARNINGS</span>
            <AlertTriangle size={16} className="text-orange-400" />
          </div>
          <div className="my-2">
            <span className="font-display text-3xl font-light text-orange-300">
              {summary.projectsCritical + summary.projectsAtRisk}
            </span>
            <span className="font-mono text-xs text-bone-muted ml-1.5">At Risk / Critical</span>
          </div>
          <div className="font-mono text-[0.68rem] text-orange-400">
            {summary.activeAlertsCount} active early warning signals
          </div>
        </AurumCard>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-silver/10 overflow-x-auto pb-1 text-xs font-mono">
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2.5 rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'projects'
              ? 'border-silver-bright text-silver-bright font-semibold bg-obsidian-2'
              : 'border-transparent text-bone-muted hover:text-bone'
          }`}
        >
          <FolderGit2 size={14} />
          <span>ASSET MANAGEMENT ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-silver-bright text-silver-bright font-semibold bg-obsidian-2'
              : 'border-transparent text-bone-muted hover:text-bone'
          }`}
        >
          <Users size={14} />
          <span>IDENTITY & CLEARANCE (IAM) ({savedAccounts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`px-4 py-2.5 rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'supabase'
              ? 'border-silver-bright text-silver-bright font-semibold bg-obsidian-2'
              : 'border-transparent text-bone-muted hover:text-bone'
          }`}
        >
          <Database size={14} />
          <span>SUPABASE DATABASE</span>
        </button>

        <button
          onClick={() => setActiveTab('thresholds')}
          className={`px-4 py-2.5 rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'thresholds'
              ? 'border-silver-bright text-silver-bright font-semibold bg-obsidian-2'
              : 'border-transparent text-bone-muted hover:text-bone'
          }`}
        >
          <Sliders size={14} />
          <span>RISK THRESHOLDS</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-silver-bright text-silver-bright font-semibold bg-obsidian-2'
              : 'border-transparent text-bone-muted hover:text-bone'
          }`}
        >
          <Activity size={14} />
          <span>AUDIT LOGS ({auditLogs.length})</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: ASSET MANAGEMENT (CRUD) */}
      {/* ============================================================ */}
      {activeTab === 'projects' && (
        <div className="space-y-4 animate-fade-in">
          {/* Search bar & quick action */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="relative w-full sm:w-80">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bone-muted" />
              <input
                type="text"
                placeholder="Search assets by name, code, contractor..."
                value={projectSearch}
                onChange={e => setProjectSearch(e.target.value)}
                className="w-full bg-obsidian-2 border border-silver/15 rounded-xl pl-9 pr-3 py-2 text-xs text-bone placeholder-bone-faint focus:outline-none focus:border-silver/40 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-bone-muted">
              <span>Showing {filteredProjects.length} of {projects.length} packages</span>
            </div>
          </div>

          {/* Asset CRUD Table */}
          <AurumCard variant="showcase" className="overflow-hidden hover-glow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-obsidian-3/90 border-b border-silver/10 text-bone-muted text-[0.68rem] uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Code / Asset Name</th>
                    <th className="p-3.5">Sector</th>
                    <th className="p-3.5">Planned (BAC)</th>
                    <th className="p-3.5">Progress</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Risk</th>
                    <th className="p-3.5">Contractor</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-silver/5">
                  {filteredProjects.map(proj => (
                    <tr key={proj.id} className="hover:bg-obsidian-3/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-semibold text-bone">{proj.name}</div>
                        <div className="text-[0.65rem] text-silver-dark">{proj.code} • {proj.location}</div>
                      </td>
                      <td className="p-3.5 text-bone-muted text-[0.72rem]">{proj.category}</td>
                      <td className="p-3.5 text-bone">₹{proj.plannedCost} Cr</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-bone">{proj.physicalProgress}%</span>
                          <div className="w-16 h-1.5 bg-obsidian-4 rounded-full overflow-hidden hidden sm:block">
                            <div className="h-full bg-silver rounded-full" style={{ width: `${proj.physicalProgress}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <AurumBadge status={proj.status} size="sm" pulse={proj.status === 'CRITICAL'} />
                      </td>
                      <td className="p-3.5">
                        <span className={`font-bold ${proj.riskScore >= 75 ? 'text-rose-400' : proj.riskScore >= 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {proj.riskScore}
                        </span>
                      </td>
                      <td className="p-3.5 text-bone-muted truncate max-w-[140px] text-[0.72rem]">{proj.contractor}</td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedProject(proj);
                              onNavigate('details');
                            }}
                            title="Inspect in Console"
                            className="p-1.5 rounded-lg bg-obsidian-3 hover:bg-obsidian-4 text-silver hover:text-white transition-colors"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => setEditingProject({ ...proj })}
                            title="Edit Asset Metrics"
                            className="p-1.5 rounded-lg bg-obsidian-3 hover:bg-obsidian-4 text-silver hover:text-white transition-colors"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(proj.id, proj.name)}
                            title="Delete Asset"
                            className="p-1.5 rounded-lg bg-obsidian-3 hover:bg-rose-950/40 text-bone-faint hover:text-rose-400 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AurumCard>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: IDENTITY & ACCESS MANAGEMENT (IAM) */}
      {/* ============================================================ */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-display text-lg text-bone">Authorized Console Identities</h3>
              <p className="text-xs text-bone-muted font-sans">
                Manage roles, division assignments, and user clearances across the platform.
              </p>
            </div>

            <AurumButton
              variant="primary"
              size="sm"
              onClick={() => setIsCreateUserOpen(true)}
              icon={<UserPlus size={14} />}
            >
              PROVISION NEW OFFICER
            </AurumButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedAccounts.map(acc => {
              const isCurrent = user?.id === acc.id || user?.email.toLowerCase() === acc.email.toLowerCase();
              return (
                <AurumCard key={acc.id} variant="showcase" className="p-4 md:p-5 flex flex-col justify-between hover-glow-card">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-obsidian-2 border border-silver/20 flex items-center justify-center font-mono font-bold text-silver-bright">
                          {acc.avatarInitials}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-bone flex items-center gap-1.5">
                            {acc.name}
                            {isCurrent && (
                              <span className="text-[0.62rem] font-mono px-1.5 py-0.2 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 rounded">
                                ACTIVE YOU
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-bone-muted">{acc.title}</p>
                        </div>
                      </div>

                      <span className="font-mono text-[0.62rem] px-2 py-0.5 rounded-full bg-obsidian-4 border border-silver/15 text-silver uppercase">
                        {acc.role.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-obsidian-3/80 border border-silver/5 font-mono text-[0.72rem] space-y-1 mb-4">
                      <div className="flex justify-between">
                        <span className="text-bone-muted">EMAIL:</span>
                        <span className="text-bone truncate max-w-[200px]">{acc.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-bone-muted">DIVISION:</span>
                        <span className="text-bone-2 truncate max-w-[200px]">{acc.department}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-silver/10 flex items-center justify-between">
                    <button
                      onClick={() => {
                        switchAccount(acc);
                        notify('info', 'Persona Switched', `Logged in as ${acc.name}.`);
                        addAuditLog('AUTH', 'Persona Switch', `Switched active clearance to ${acc.name}.`);
                      }}
                      className="btn-aurum-secondary !py-1 text-xs"
                    >
                      <span>Impersonate / Switch</span>
                    </button>

                    {acc.id.startsWith('usr-') && !['usr-dir-01', 'usr-fin-02', 'usr-site-03', 'usr-risk-04'].includes(acc.id) && (
                      <button
                        onClick={() => handleDeleteUser(acc.id, acc.name)}
                        className="text-xs font-mono text-rose-400 hover:text-rose-300 p-1 transition-colors"
                        title="Delete custom user"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </AurumCard>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: SUPABASE DATABASE OPERATIONS */}
      {/* ============================================================ */}
      {activeTab === 'supabase' && (
        <div className="space-y-6 animate-fade-in">
          <AurumCard variant="showcase" className="p-6 hover-glow-card">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Database size={18} className="text-silver-bright" />
                <span className="mono-label text-silver-bright">SUPABASE POSTGRESQL TELEMETRY</span>
              </div>
              <div className="flex items-center gap-2">
                {dbStatus.success ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-xs font-mono text-emerald-400 font-semibold">
                    <Wifi size={13} />
                    LIVE CONNECTED {dbStatus.latencyMs ? `(${dbStatus.latencyMs}ms)` : ''}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-obsidian-3 border border-silver/15 text-xs font-mono text-silver-dark">
                    <WifiOff size={13} />
                    LOCAL ENGINE (OFFLINE)
                  </span>
                )}
              </div>
            </div>

            {/* Credential Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="mono-label block mb-1">SUPABASE URL</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={e => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
                />
              </div>
              <div>
                <label className="mono-label block mb-1">SUPABASE ANON KEY</label>
                <input
                  type="password"
                  value={supabaseAnonKey}
                  onChange={e => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center flex-wrap gap-3 pt-2">
              <AurumButton variant="primary" size="sm" onClick={handleSaveSupabaseConfig}>
                SAVE CONFIG
              </AurumButton>
              <button onClick={handleTestConnection} className="btn-aurum-secondary text-xs flex items-center gap-1.5">
                <Wifi size={13} />
                <span>TEST PING</span>
              </button>
              <button
                onClick={handleSyncToSupabase}
                disabled={isSyncingDb}
                className="btn-aurum-secondary text-xs flex items-center gap-1.5 text-emerald-300 border-emerald-500/30"
              >
                <CloudUpload size={13} />
                <span>{isSyncingDb ? 'SYNCING...' : 'SYNC ALL LOCAL DATA TO SUPABASE'}</span>
              </button>
              <button
                onClick={() => setShowSqlModal(true)}
                className="btn-aurum-secondary text-xs flex items-center gap-1.5"
              >
                <Code2 size={13} />
                <span>VIEW DDL SCHEMA</span>
              </button>
            </div>

            {/* Table Row Counts */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-silver/10 text-xs font-mono">
              <div className="p-3 rounded-xl bg-obsidian-2 border border-silver/10">
                <span className="text-bone-muted text-[0.65rem] block">PUBLIC.PROJECTS</span>
                <span className="font-display text-xl text-bone">{dbCounts.projectsCount}</span>
                <span className="text-[0.62rem] text-silver-dark block">Rows verified</span>
              </div>
              <div className="p-3 rounded-xl bg-obsidian-2 border border-silver/10">
                <span className="text-bone-muted text-[0.65rem] block">PUBLIC.ALERTS</span>
                <span className="font-display text-xl text-bone">{dbCounts.alertsCount}</span>
                <span className="text-[0.62rem] text-silver-dark block">Signals tracked</span>
              </div>
              <div className="p-3 rounded-xl bg-obsidian-2 border border-silver/10">
                <span className="text-bone-muted text-[0.65rem] block">PUBLIC.MILESTONES</span>
                <span className="font-display text-xl text-bone">{dbCounts.milestonesCount}</span>
                <span className="text-[0.62rem] text-silver-dark block">Critical stage-gates</span>
              </div>
            </div>
          </AurumCard>

          {/* Database Reset Card */}
          <AurumCard variant="showcase" className="p-5 flex items-center justify-between flex-wrap gap-4 hover-glow-card">
            <div>
              <h4 className="text-sm font-semibold text-bone">Restore Factory Seed Baseline</h4>
              <p className="text-xs text-bone-muted">Reset all synthetic portfolio assets, risk models, and trajectories.</p>
            </div>
            <button
              onClick={() => {
                if (confirm('Revert all project data to factory baseline?')) {
                  resetToDefaults();
                  notify('info', 'Factory Baseline Restored', 'Re-initialized all 6 synthetic infrastructure assets.');
                  addAuditLog('SYSTEM', 'Baseline Restored', 'Reset all projects to seed state.');
                }
              }}
              className="btn-aurum-secondary text-xs text-rose-300 border-rose-500/20"
            >
              <RotateCcw size={14} />
              <span>FACTORY SEED RESET</span>
            </button>
          </AurumCard>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: RISK THRESHOLDS & ENGINE GOVERNANCE */}
      {/* ============================================================ */}
      {activeTab === 'thresholds' && (
        <div className="space-y-6 animate-fade-in max-w-2xl">
          <AurumCard variant="showcase" className="p-6 space-y-5 hover-glow-card">
            <div>
              <h3 className="font-display text-lg text-bone">Early Warning Anomaly Triggers</h3>
              <p className="text-xs text-bone-muted font-sans mt-0.5">
                Calibrate sensitivity for automated escalation and notification triggers.
              </p>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-bone">CRITICAL RISK SCORE CUTOFF</span>
                  <span className="font-bold text-rose-400">≥ {thresholds.criticalRisk} / 100</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="90"
                  value={thresholds.criticalRisk}
                  onChange={e => setThresholds({ ...thresholds, criticalRisk: Number(e.target.value) })}
                  className="w-full accent-silver-bright bg-obsidian-4 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-bone">COST PERFORMANCE INDEX (CPI) WARNING TRIGGER</span>
                  <span className="font-bold text-amber-400">&lt; {thresholds.cpiWarning}</span>
                </div>
                <input
                  type="range"
                  min="0.70"
                  max="0.98"
                  step="0.01"
                  value={thresholds.cpiWarning}
                  onChange={e => setThresholds({ ...thresholds, cpiWarning: Number(e.target.value) })}
                  className="w-full accent-silver-bright bg-obsidian-4 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-bone">SCHEDULE PERFORMANCE INDEX (SPI) WARNING TRIGGER</span>
                  <span className="font-bold text-amber-400">&lt; {thresholds.spiWarning}</span>
                </div>
                <input
                  type="range"
                  min="0.70"
                  max="0.98"
                  step="0.01"
                  value={thresholds.spiWarning}
                  onChange={e => setThresholds({ ...thresholds, spiWarning: Number(e.target.value) })}
                  className="w-full accent-silver-bright bg-obsidian-4 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-bone">MILESTONE SLIPPAGE TOLERANCE (MONTHS)</span>
                  <span className="font-bold text-silver-bright">&gt; {thresholds.milestoneDelayBuffer} mos</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.5"
                  value={thresholds.milestoneDelayBuffer}
                  onChange={e => setThresholds({ ...thresholds, milestoneDelayBuffer: Number(e.target.value) })}
                  className="w-full accent-silver-bright bg-obsidian-4 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-silver/10 flex justify-end">
              <AurumButton variant="primary" size="sm" onClick={handleSaveThresholds}>
                SAVE ANOMALY THRESHOLDS
              </AurumButton>
            </div>
          </AurumCard>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: AUDIT LOGS & EVENT STREAM */}
      {/* ============================================================ */}
      {activeTab === 'audit' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg text-bone">System Audit & Governance Ledger</h3>
            <span className="font-mono text-xs text-bone-muted">{auditLogs.length} events logged</span>
          </div>

          <AurumCard variant="showcase" className="p-4 hover-glow-card">
            <div className="divide-y divide-silver/10">
              {auditLogs.map(log => {
                const categoryBadge = {
                  AUTH: 'bg-indigo-950/50 border-indigo-500/30 text-indigo-300',
                  CRUD: 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300',
                  SUPABASE: 'bg-cyan-950/50 border-cyan-500/30 text-cyan-300',
                  EVM: 'bg-amber-950/50 border-amber-500/30 text-amber-300',
                  SYSTEM: 'bg-silver/10 border-silver/20 text-silver-bright',
                }[log.category];

                return (
                  <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-start gap-2.5">
                      <span className={`px-2 py-0.5 rounded text-[0.62rem] font-bold border shrink-0 ${categoryBadge}`}>
                        {log.category}
                      </span>
                      <div>
                        <div className="text-bone font-medium">{log.action}</div>
                        <div className="text-bone-muted text-[0.72rem]">{log.details}</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 text-[0.68rem] text-bone-faint pl-7 sm:pl-0">
                      <div>{log.actor}</div>
                      <div>{log.timestamp}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </AurumCard>
        </div>
      )}

      {/* Modal: Edit Asset */}
      {editingProject && (
        <AurumModal
          isOpen={Boolean(editingProject)}
          onClose={() => setEditingProject(null)}
          title={`EDIT ASSET — ${editingProject.code}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveEditedProject} className="space-y-4 animate-fade-in">
            <div>
              <label className="mono-label block mb-1">PROJECT NAME</label>
              <input
                type="text"
                required
                value={editingProject.name}
                onChange={e => setEditingProject({ ...editingProject, name: e.target.value })}
                className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mono-label block mb-1">PLANNED COST (₹ CR)</label>
                <input
                  type="number"
                  required
                  value={editingProject.plannedCost}
                  onChange={e => setEditingProject({ ...editingProject, plannedCost: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
                />
              </div>
              <div>
                <label className="mono-label block mb-1">CURRENT EXPENDITURE (₹ CR)</label>
                <input
                  type="number"
                  required
                  value={editingProject.currentExpenditure}
                  onChange={e => setEditingProject({ ...editingProject, currentExpenditure: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mono-label block mb-1">PHYSICAL PROGRESS (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingProject.physicalProgress}
                  onChange={e => setEditingProject({ ...editingProject, physicalProgress: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
                />
              </div>
              <div>
                <label className="mono-label block mb-1">STATUS</label>
                <select
                  value={editingProject.status}
                  onChange={e => setEditingProject({ ...editingProject, status: e.target.value as ProjectStatus })}
                  className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
                >
                  <option value="ON TRACK">ON TRACK</option>
                  <option value="WATCH">WATCH</option>
                  <option value="AT RISK">AT RISK</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mono-label block mb-1">CONTRACTOR</label>
                <input
                  type="text"
                  value={editingProject.contractor}
                  onChange={e => setEditingProject({ ...editingProject, contractor: e.target.value })}
                  className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
                />
              </div>
              <div>
                <label className="mono-label block mb-1">RESIDENT ENGINEER</label>
                <input
                  type="text"
                  value={editingProject.manager}
                  onChange={e => setEditingProject({ ...editingProject, manager: e.target.value })}
                  className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="px-4 py-2 text-xs font-mono text-bone-muted hover:text-bone"
              >
                CANCEL
              </button>
              <AurumButton type="submit" variant="primary" size="md">
                SAVE ASSET MODIFICATIONS
              </AurumButton>
            </div>
          </form>
        </AurumModal>
      )}

      {/* Modal: Create Asset */}
      <AurumModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        title="PROVISION NEW INFRASTRUCTURE PACKAGE"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateProject} className="space-y-4 animate-fade-in">
          <div>
            <label className="mono-label block mb-1">PROJECT NAME</label>
            <input
              type="text"
              required
              value={pName}
              onChange={e => setPName(e.target.value)}
              placeholder="e.g. Chenab River Rail Arch Bridge Package"
              className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mono-label block mb-1">PACKAGE CODE</label>
              <input
                type="text"
                required
                value={pCode}
                onChange={e => setPCode(e.target.value)}
                placeholder="e.g. CRB-PKG-01"
                className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
              />
            </div>
            <div>
              <label className="mono-label block mb-1">SECTOR</label>
              <select
                value={pCategory}
                onChange={e => setPCategory(e.target.value as Project['category'])}
                className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
              >
                <option value="Highways & Expressways">Highways & Expressways</option>
                <option value="Rail Transit & Metros">Rail Transit & Metros</option>
                <option value="Bridges & Tunnels">Bridges & Tunnels</option>
                <option value="Ports & Maritime">Ports & Maritime</option>
                <option value="Energy Infrastructure">Energy Infrastructure</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mono-label block mb-1">LOCATION</label>
              <input
                type="text"
                required
                value={pLocation}
                onChange={e => setPLocation(e.target.value)}
                placeholder="e.g. Reasi District, J&K"
                className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
              />
            </div>
            <div>
              <label className="mono-label block mb-1">STATE</label>
              <input
                type="text"
                required
                value={pState}
                onChange={e => setPState(e.target.value)}
                placeholder="e.g. Jammu & Kashmir"
                className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mono-label block mb-1">BUDGET (₹ CRORES)</label>
              <input
                type="number"
                required
                value={pPlannedCost}
                onChange={e => setPPlannedCost(e.target.value)}
                className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
              />
            </div>
            <div>
              <label className="mono-label block mb-1">DURATION (MONTHS)</label>
              <input
                type="number"
                required
                value={pDuration}
                onChange={e => setPDuration(e.target.value)}
                className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateProjectOpen(false)}
              className="px-4 py-2 text-xs font-mono text-bone-muted hover:text-bone"
            >
              CANCEL
            </button>
            <AurumButton type="submit" variant="primary" size="md">
              INITIALIZE ASSET
            </AurumButton>
          </div>
        </form>
      </AurumModal>

      {/* Modal: Provision Officer */}
      <AurumModal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        title="PROVISION NEW OFFICER IDENTITY"
        maxWidth="md"
      >
        <form onSubmit={handleProvisionUser} className="space-y-4 animate-fade-in">
          <div>
            <label className="mono-label block mb-1">OFFICER FULL NAME</label>
            <input
              type="text"
              required
              value={newUserName}
              onChange={e => setNewUserName(e.target.value)}
              placeholder="e.g. Er. Devendra Gupta"
              className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
            />
          </div>

          <div>
            <label className="mono-label block mb-1">ORGANIZATIONAL EMAIL</label>
            <input
              type="email"
              required
              value={newUserEmail}
              onChange={e => setNewUserEmail(e.target.value)}
              placeholder="devendra.gupta@masterdev.infra"
              className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
            />
          </div>

          <div>
            <label className="mono-label block mb-1">CLEARANCE LEVEL</label>
            <select
              value={newUserRole}
              onChange={e => setNewUserRole(e.target.value as UserRole)}
              className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
            >
              <option value="PROJECT_DIRECTOR">Project Director (Portfolio Overview)</option>
              <option value="EXECUTIVE_CONTROLLER">Executive Financial Controller (EVM)</option>
              <option value="SITE_SUPERVISOR">Site Resident Engineer</option>
              <option value="LEAD_RISK_ANALYST">AI Risk Intelligence Officer</option>
            </select>
          </div>

          <div>
            <label className="mono-label block mb-1">DEPARTMENT / DIVISION</label>
            <input
              type="text"
              required
              value={newUserDept}
              onChange={e => setNewUserDept(e.target.value)}
              placeholder="e.g. Coastal Corridors & Port Wing"
              className="w-full bg-obsidian-3 border border-silver/20 rounded-xl px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateUserOpen(false)}
              className="px-4 py-2 text-xs font-mono text-bone-muted hover:text-bone"
            >
              CANCEL
            </button>
            <AurumButton type="submit" variant="primary" size="md">
              PROVISION ACCOUNT
            </AurumButton>
          </div>
        </form>
      </AurumModal>

      {/* Modal: View SQL Schema */}
      <AurumModal
        isOpen={showSqlModal}
        onClose={() => setShowSqlModal(false)}
        title="SUPABASE POSTGRESQL DDL SCHEMA"
        maxWidth="xl"
      >
        <div className="space-y-3 animate-fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-silver/10">
            <span className="mono-label text-[0.65rem]">EXECUTE IN SUPABASE SQL EDITOR</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                setSqlCopied(true);
                notify('success', 'Copied to Clipboard', 'Paste into your Supabase SQL editor.');
                setTimeout(() => setSqlCopied(false), 2500);
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-obsidian-3 hover:bg-obsidian-4 border border-silver/20 text-xs font-mono text-silver-bright"
            >
              <Copy size={13} />
              <span>{sqlCopied ? 'COPIED!' : 'COPY SCHEMA'}</span>
            </button>
          </div>
          <pre className="text-[0.72rem] font-mono text-bone-muted bg-obsidian-1 p-3 rounded-xl max-h-96 overflow-y-auto leading-relaxed border border-silver/10">
            {SUPABASE_SQL_SCHEMA}
          </pre>
        </div>
      </AurumModal>
    </div>
  );
};
