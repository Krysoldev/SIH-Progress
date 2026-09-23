import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  Building2,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { AurumBadge } from '../common/AurumBadge';

interface AurumHeaderProps {
  onToggleMobile: () => void;
  onNavigateToAlerts: () => void;
  onNavigateToCopilot: () => void;
}

export const AurumHeader: React.FC<AurumHeaderProps> = ({
  onToggleMobile,
  onNavigateToAlerts,
  onNavigateToCopilot,
}) => {
  const { projects, selectedProject, setSelectedProject, searchQuery, setSearchQuery, summary } = useProjects();
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-obsidian-1/90 backdrop-blur-md border-b border-silver/10 px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Project context switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="lg:hidden text-bone-muted hover:text-bone p-1.5 rounded-lg hover:bg-obsidian-3"
          aria-label="Toggle Navigation Drawer"
        >
          <Menu size={20} />
        </button>

        {/* Project Context Quick Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-obsidian-2/90 border border-silver/15 hover:border-silver/30 text-left transition-all group"
          >
            <Building2 size={15} className="text-silver-deep group-hover:text-silver" />
            <div className="hidden sm:block">
              <p className="font-mono text-[0.62rem] text-silver-dark tracking-wider uppercase">
                ACTIVE CONTEXT
              </p>
              <p className="text-xs font-medium text-bone truncate max-w-[200px] md:max-w-[260px]">
                {selectedProject?.name || 'All Projects'}
              </p>
            </div>
            <span className="sm:hidden text-xs text-bone font-medium truncate max-w-[120px]">
              {selectedProject?.name || 'Select'}
            </span>
            <ChevronDown size={14} className="text-bone-muted ml-1" />
          </button>

          {/* Context Dropdown Menu */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-80 md:w-96 bg-obsidian-2 border border-silver/20 rounded-showcase shadow-deep p-2 z-50 animate-in fade-in duration-100">
                <div className="px-3 py-2 border-b border-silver/10">
                  <p className="font-mono text-[0.65rem] text-bone-muted uppercase tracking-widest">
                    SWITCH PROJECT CONSOLE CONTEXT
                  </p>
                </div>
                <div className="max-h-72 overflow-y-auto py-1 space-y-1">
                  {projects.map(proj => (
                    <button
                      key={proj.id}
                      onClick={() => {
                        setSelectedProject(proj);
                        setIsDropdownOpen(false);
                      }}
                      className={`
                        w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-colors
                        ${
                          selectedProject?.id === proj.id
                            ? 'bg-obsidian-4 text-silver-bright border border-silver/20'
                            : 'hover:bg-obsidian-3/60 text-bone'
                        }
                      `}
                    >
                      <div className="overflow-hidden pr-2">
                        <p className="font-medium truncate">{proj.name}</p>
                        <p className="font-mono text-[0.65rem] text-bone-muted truncate">
                          {proj.location} • ₹{proj.plannedCost} Cr
                        </p>
                      </div>
                      <AurumBadge status={proj.status} size="sm" />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: Search, AI Copilot shortcut, Alerts badge, User indicator */}
      <div className="flex items-center gap-3">
        {/* Search input */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bone-muted" />
          <input
            type="text"
            placeholder="Search projects, signals..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-obsidian-2/80 border border-silver/15 rounded-pill pl-9 pr-3 py-1.5 text-xs text-bone placeholder-bone-faint focus:outline-none focus:border-silver/40 transition-colors font-sans"
          />
        </div>

        {/* AI Copilot Quick Action */}
        <button
          onClick={onNavigateToCopilot}
          title="Open AI Project Copilot"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-obsidian-3/80 border border-silver/20 hover:border-silver-bright/40 text-xs font-mono tracking-wider text-silver-bright transition-all group"
        >
          <Sparkles size={13} className="text-silver-bright group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">AI COPILOT</span>
        </button>

        {/* Alerts Notification Bell */}
        <button
          onClick={onNavigateToAlerts}
          title="View Active Early Warnings"
          className="relative p-2 rounded-full bg-obsidian-2 hover:bg-obsidian-3 text-bone-muted hover:text-bone border border-silver/10 transition-colors"
        >
          <Bell size={16} />
          {summary.activeAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-600 border border-obsidian-0 rounded-full text-[0.62rem] font-mono text-white flex items-center justify-center font-bold">
              {summary.activeAlertsCount}
            </span>
          )}
        </button>

        {/* Role Pill */}
        {user && (
          <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-silver/10">
            <span className="font-mono text-[0.62rem] px-2 py-0.5 rounded-full bg-obsidian-3 border border-silver/15 text-silver tracking-wider uppercase">
              {user.role.replace(/_/g, ' ')}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
