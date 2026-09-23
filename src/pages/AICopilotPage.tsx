import React from 'react';
import { useProjects } from '../context/ProjectContext';
import { ScreenId } from '../components/layout/AurumSidebar';
import { CopilotChat } from '../components/ai/CopilotChat';
import { CopilotContextDrawer } from '../components/ai/CopilotContextDrawer';

interface AICopilotPageProps {
  onNavigate: (screen: ScreenId) => void;
}

export const AICopilotPage: React.FC<AICopilotPageProps> = ({ onNavigate }) => {
  const { selectedProject, projects } = useProjects();

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Editorial Header */}

      <div className="border-b border-silver/10 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="mono-label">NATURAL LANGUAGE INTELLIGENCE CONSOLE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="font-mono text-[0.68rem] text-bone-muted">ACTIVE</span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-bone font-light tracking-tight">
          PROJECT INTELLIGENCE COPILOT
        </h1>
        <p className="text-bone-muted text-xs md:text-sm mt-1">
          Evidence-grounded project querying, root-cause attribution, and forward-looking interventions.
        </p>
      </div>

      {/* Main Copilot Grid: Context Drawer (4 cols) + Conversation Window (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Telemetry Context Panel */}
        <div className="lg:col-span-4">
          <CopilotContextDrawer project={selectedProject} />
        </div>

        {/* Right Interactive Chat Panel */}
        <div className="lg:col-span-8">
          <CopilotChat
            project={selectedProject}
            allProjects={projects}
          />
        </div>
      </div>
    </div>
  );
};
