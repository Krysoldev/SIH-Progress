import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, PortfolioSummary, MilestoneStatus } from '../types/project';
import { ProjectService } from '../services/projectService';
import { calculatePortfolioSummary } from '../data/syntheticProjects';

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project;
  setSelectedProject: (project: Project) => void;
  setSelectedProjectId: (id: string) => void;
  summary: PortfolioSummary;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  isLoading: boolean;
  refreshProjects: () => Promise<void>;
  updateMilestone: (projectId: string, milestoneId: string, status: MilestoneStatus) => Promise<void>;
  acknowledgeAlert: (projectId: string, alertId: string) => Promise<void>;
  resetToDefaults: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectIdState] = useState<string>('proj-highway-exp-01');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await ProjectService.getAllProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0] || ({} as Project);

  const setSelectedProject = (p: Project) => {
    setSelectedProjectIdState(p.id);
  };

  const setSelectedProjectId = (id: string) => {
    setSelectedProjectIdState(id);
  };

  const updateMilestone = async (projectId: string, milestoneId: string, status: MilestoneStatus) => {
    const updated = await ProjectService.updateMilestoneStatus(projectId, milestoneId, status);
    if (updated) {
      setProjects(prev => prev.map(p => (p.id === projectId ? updated : p)));
    }
  };

  const acknowledgeAlert = async (projectId: string, alertId: string) => {
    const updated = await ProjectService.updateAlertStatus(projectId, alertId, 'ACKNOWLEDGED');
    if (updated) {
      setProjects(prev => prev.map(p => (p.id === projectId ? updated : p)));
    }
  };

  const resetToDefaults = () => {
    ProjectService.resetToDefaultData();
    loadProjects();
  };

  const summary = calculatePortfolioSummary(projects);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProject,
        setSelectedProject,
        setSelectedProjectId,
        summary,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        isLoading,
        refreshProjects: loadProjects,
        updateMilestone,
        acknowledgeAlert,
        resetToDefaults,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
