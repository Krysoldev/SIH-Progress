import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  FileSpreadsheet,
  BarChart3,
  ShieldAlert,
  BellRing,
  Bot,
  MapPin,
  FileText,
  SlidersHorizontal,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';

export type ScreenId =
  | 'overview'
  | 'projects'
  | 'details'
  | 'analytics'
  | 'risk'
  | 'alerts'
  | 'copilot'
  | 'map'
  | 'reports'
  | 'simulation'
  | 'settings';

interface AurumSidebarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const AurumSidebar: React.FC<AurumSidebarProps> = ({
  currentScreen,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  const { summary } = useProjects();

  const navigationItems: { id: ScreenId; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'OVERVIEW', icon: <LayoutDashboard size={17} /> },
    { id: 'projects', label: 'PROJECTS', icon: <FolderGit2 size={17} />, badge: summary.totalProjects },
    { id: 'details', label: 'PROJECT DETAILS', icon: <FileSpreadsheet size={17} /> },
    { id: 'analytics', label: 'ANALYTICS', icon: <BarChart3 size={17} /> },
    { id: 'risk', label: 'RISK ANALYSIS', icon: <ShieldAlert size={17} />, badge: summary.projectsAtRisk },
    { id: 'alerts', label: 'EARLY WARNINGS', icon: <BellRing size={17} />, badge: summary.activeAlertsCount },
    { id: 'copilot', label: 'AI COPILOT', icon: <Bot size={17} /> },
    { id: 'map', label: 'GIS MAP', icon: <MapPin size={17} /> },
    { id: 'reports', label: 'REPORTS', icon: <FileText size={17} /> },
    { id: 'simulation', label: 'SIMULATION', icon: <SlidersHorizontal size={17} /> },
  ];

  const handleItemClick = (screen: ScreenId) => {
    onNavigate(screen);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-obsidian-0/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-40 w-64 md:w-68 bg-obsidian-1/95 border-r border-silver/10
          flex flex-col justify-between transition-transform duration-300 ease-in-out
          lg:translate-x-0 ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Top Brand Block */}
        <div>
          <div className="p-5 border-b border-silver/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Aurum Metallic Brand Mark */}
              <div className="w-8 h-8 rounded-full border border-silver/40 bg-gradient-to-br from-silver-bright via-silver to-silver-dark flex items-center justify-center shadow-silver-glow">
                <div className="w-4 h-4 rounded-full bg-obsidian-1 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-silver-bright" />
                </div>
              </div>
              <div>
                <h1 className="font-display text-lg font-light tracking-wide text-bone">
                  MASTER <span className="text-silver italic">DEV</span>
                </h1>
                <p className="font-mono text-[0.62rem] tracking-widest text-silver-dark uppercase">
                  AURUM INTELLIGENCE
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            <p className="px-3 pt-2 pb-1 font-mono text-[0.62rem] uppercase tracking-widest text-bone-faint">
              PLATFORM CONSOLE
            </p>
            {navigationItems.map(item => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono tracking-wider
                    transition-all duration-150 relative group
                    ${
                      isActive
                        ? 'bg-obsidian-3/90 text-silver-bright border border-silver/20 shadow-sm'
                        : 'text-bone-muted hover:text-bone hover:bg-obsidian-2/60 border border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Active Silver Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-gradient-to-b from-silver-bright to-silver rounded-r" />
                    )}
                    <span className={isActive ? 'text-silver-bright' : 'text-bone-muted group-hover:text-silver'}>
                      {item.icon}
                    </span>
                    <span className="font-medium text-[0.72rem]">{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`
                        text-[0.65rem] font-mono px-1.5 py-0.5 rounded-full border
                        ${
                          item.id === 'alerts' || item.id === 'risk'
                            ? 'bg-orange-950/40 text-orange-200 border-orange-800/40'
                            : 'bg-obsidian-4 text-silver-deep border-silver/10'
                        }
                      `}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile & Settings */}
        <div className="p-3 border-t border-silver/10 bg-obsidian-0/60">
          <button
            onClick={() => handleItemClick('settings')}
            className={`
              w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono tracking-wider mb-2
              ${
                currentScreen === 'settings'
                  ? 'bg-obsidian-3 text-silver-bright border border-silver/20'
                  : 'text-bone-muted hover:text-bone hover:bg-obsidian-2/50 border border-transparent'
              }
            `}
          >
            <div className="flex items-center gap-2.5">
              <Settings size={16} />
              <span className="text-[0.72rem]">SETTINGS & ROLES</span>
            </div>
            <ChevronRight size={14} className="text-bone-faint" />
          </button>

          {/* User profile preview */}
          {user && (
            <div className="px-3 py-2.5 rounded-xl bg-obsidian-2/90 border border-silver/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-7 h-7 rounded-full bg-obsidian-4 border border-silver/20 text-silver-bright font-mono text-xs flex items-center justify-center shrink-0">
                  {user.avatarInitials}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-medium text-bone truncate">{user.name}</p>
                  <p className="font-mono text-[0.62rem] text-silver-dark tracking-wider uppercase truncate">
                    {user.role.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="text-bone-faint hover:text-red-300 p-1 rounded hover:bg-obsidian-4 transition-colors"
                aria-label="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
