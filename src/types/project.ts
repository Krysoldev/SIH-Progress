export type ProjectStatus = 'ON TRACK' | 'WATCH' | 'AT RISK' | 'CRITICAL';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AlertType = 'SCHEDULE' | 'COST' | 'PROGRESS' | 'MILESTONE' | 'RISK';

export type MilestoneStatus = 'COMPLETED' | 'IN_PROGRESS' | 'DELAYED' | 'PENDING';

export interface ProgressReport {
  monthIndex: number;
  reportDate: string;
  plannedProgress: number; // percentage
  actualProgress: number | null; // percentage
  plannedExpenditure: number; // in Cr
  actualExpenditure: number | null; // in Cr
  forecastProgress?: number | null;
  forecastExpenditure?: number | null;
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  plannedDate: string;
  actualDate?: string | null;
  status: MilestoneStatus;
  criticalPath: boolean;
  delayMonths: number;
  weightage: number; // percent contribution
}

export interface RiskBreakdown {
  overallScore: number; // 0-100
  costRisk: number; // 0-100
  scheduleRisk: number; // 0-100
  progressRisk: number; // 0-100
  milestoneRisk: number; // 0-100
  riskLevel: RiskLevel;
  rootCauses: string[];
}

export interface AlertItem {
  id: string;
  projectId: string;
  projectName: string;
  alertType: AlertType;
  severity: RiskLevel;
  signal: string;
  impact: string;
  recommendedAction: string;
  detectedAt: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
}

export interface EVMMetrics {
  pv: number; // Planned Value (₹ Cr)
  ev: number; // Earned Value (₹ Cr)
  ac: number; // Actual Cost (₹ Cr)
  cv: number; // Cost Variance = EV - AC
  sv: number; // Schedule Variance = EV - PV
  cpi: number; // Cost Performance Index = EV / AC
  spi: number; // Schedule Performance Index = EV / PV
  eac: number; // Estimate at Completion
  vac: number; // Variance at Completion
  tcpi: number; // To-Complete Performance Index
}

export interface PredictionModel {
  predictedCostOverrun: number; // in ₹ Cr
  predictedTimeOverrun: number; // in months
  confidenceScore: number; // 0.0 - 1.0
  modelName: string;
  lastUpdated: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  location: string;
  state: string;
  lat: number;
  lng: number;
  plannedCost: number; // ₹ Cr
  currentExpenditure: number; // ₹ Cr
  physicalProgress: number; // 0-100 %
  plannedDuration: number; // months
  elapsedDuration: number; // months
  status: ProjectStatus;
  riskScore: number; // 0-100
  category: 'Highways & Expressways' | 'Rail Transit & Metros' | 'Bridges & Tunnels' | 'Ports & Maritime' | 'Energy Infrastructure';
  contractor: string;
  manager: string;
  lastUpdate: string;
  description: string;
  riskBreakdown: RiskBreakdown;
  evm: EVMMetrics;
  prediction: PredictionModel;
  milestones: Milestone[];
  trajectory: ProgressReport[];
  alerts: AlertItem[];
}

export interface PortfolioSummary {
  totalProjects: number;
  projectsAtRisk: number;
  projectsCritical: number;
  projectsWatch: number;
  projectsOnTrack: number;
  totalPlannedCost: number;
  totalCurrentExpenditure: number;
  averageProgress: number;
  averageScheduleDelay: number;
  forecastCostOverrun: number;
  activeAlertsCount: number;
}
