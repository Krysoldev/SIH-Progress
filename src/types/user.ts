export type UserRole =
  | 'PROJECT_DIRECTOR'
  | 'EXECUTIVE_CONTROLLER'
  | 'SITE_SUPERVISOR'
  | 'LEAD_RISK_ANALYST';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  title: string;
  role: UserRole;
  department: string;
  avatarInitials: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  demoMode: boolean;
}
