import { Project, AlertItem } from '../types/project';
import { SYNTHETIC_PROJECTS } from '../data/syntheticProjects';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY = 'aurum_master_dev_projects_v1';

export class ProjectService {
  private static loadLocalProjects(): Project[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
    }
    // Initialize with synthetic data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SYNTHETIC_PROJECTS));
    return SYNTHETIC_PROJECTS;
  }

  private static saveLocalProjects(projects: Project[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.warn('Error writing to localStorage:', e);
    }
  }

  static async getAllProjects(): Promise<Project[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('projects').select('*');
        if (!error && data && data.length > 0) {
          return data as unknown as Project[];
        }
      } catch (err) {
        console.warn('Supabase fetch failed, using local projects:', err);
      }
    }
    return this.loadLocalProjects();
  }

  static async getProjectById(id: string): Promise<Project | null> {
    const projects = await this.getAllProjects();
    const found = projects.find(p => p.id === id);
    return found || null;
  }

  static async updateMilestoneStatus(
    projectId: string,
    milestoneId: string,
    newStatus: 'COMPLETED' | 'IN_PROGRESS' | 'DELAYED' | 'PENDING'
  ): Promise<Project | null> {
    const projects = this.loadLocalProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return null;

    const project = projects[projectIndex];
    project.milestones = project.milestones.map(m => {
      if (m.id === milestoneId) {
        return {
          ...m,
          status: newStatus,
          actualDate: newStatus === 'COMPLETED' ? `Month ${project.elapsedDuration}` : m.actualDate,
        };
      }
      return m;
    });

    // Recompute milestone risk
    const delayedCount = project.milestones.filter(m => m.status === 'DELAYED').length;
    project.riskBreakdown.milestoneRisk = Math.min(100, Math.round(delayedCount * 28 + 20));
    project.riskScore = Math.round(
      (project.riskBreakdown.scheduleRisk * 0.35) +
      (project.riskBreakdown.costRisk * 0.25) +
      (project.riskBreakdown.progressRisk * 0.25) +
      (project.riskBreakdown.milestoneRisk * 0.15)
    );

    projects[projectIndex] = project;
    this.saveLocalProjects(projects);
    return project;
  }

  static async updateAlertStatus(
    projectId: string,
    alertId: string,
    status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'
  ): Promise<Project | null> {
    const projects = this.loadLocalProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return null;

    const project = projects[projectIndex];
    project.alerts = project.alerts.map(a => (a.id === alertId ? { ...a, status } : a));

    projects[projectIndex] = project;
    this.saveLocalProjects(projects);
    return project;
  }

  static async getAllActiveAlerts(): Promise<AlertItem[]> {
    const projects = await this.getAllProjects();
    const alerts: AlertItem[] = [];
    projects.forEach(p => {
      p.alerts.forEach(a => {
        alerts.push({
          ...a,
          projectName: p.name,
        });
      });
    });
    return alerts;
  }

  static async createProject(newProject: Project): Promise<Project> {
    const projects = this.loadLocalProjects();
    const updated = [newProject, ...projects];
    this.saveLocalProjects(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('projects').upsert({
          id: newProject.id,
          code: newProject.code,
          name: newProject.name,
          location: newProject.location,
          state: newProject.state,
          lat: newProject.lat,
          lng: newProject.lng,
          planned_cost: newProject.plannedCost,
          current_expenditure: newProject.currentExpenditure,
          physical_progress: newProject.physicalProgress,
          planned_duration: newProject.plannedDuration,
          elapsed_duration: newProject.elapsedDuration,
          status: newProject.status,
          risk_score: newProject.riskScore,
          category: newProject.category,
          contractor: newProject.contractor,
          manager: newProject.manager,
          description: newProject.description,
          last_update: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Supabase project sync on create failed:', e);
      }
    }

    return newProject;
  }

  static async updateProject(updatedProject: Project): Promise<Project> {
    const projects = this.loadLocalProjects();
    const index = projects.findIndex(p => p.id === updatedProject.id);
    if (index !== -1) {
      projects[index] = updatedProject;
      this.saveLocalProjects(projects);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('projects').upsert({
          id: updatedProject.id,
          code: updatedProject.code,
          name: updatedProject.name,
          location: updatedProject.location,
          state: updatedProject.state,
          lat: updatedProject.lat,
          lng: updatedProject.lng,
          planned_cost: updatedProject.plannedCost,
          current_expenditure: updatedProject.currentExpenditure,
          physical_progress: updatedProject.physicalProgress,
          planned_duration: updatedProject.plannedDuration,
          elapsed_duration: updatedProject.elapsedDuration,
          status: updatedProject.status,
          risk_score: updatedProject.riskScore,
          category: updatedProject.category,
          contractor: updatedProject.contractor,
          manager: updatedProject.manager,
          description: updatedProject.description,
          last_update: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Supabase project sync on update failed:', e);
      }
    }

    return updatedProject;
  }

  static async deleteProject(id: string): Promise<boolean> {

    const projects = this.loadLocalProjects();
    const updated = projects.filter(p => p.id !== id);
    this.saveLocalProjects(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('projects').delete().eq('id', id);
        await supabase.from('alerts').delete().eq('project_id', id);
        await supabase.from('milestones').delete().eq('project_id', id);
      } catch (e) {
        console.warn('Supabase project delete failed:', e);
      }
    }

    return true;
  }

  static resetToDefaultData(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SYNTHETIC_PROJECTS));
  }
}


