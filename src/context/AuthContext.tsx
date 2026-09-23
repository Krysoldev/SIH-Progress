import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types/user';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
}

const DEFAULT_USERS: Record<UserRole, UserProfile> = {
  PROJECT_DIRECTOR: {
    id: 'usr-dir-01',
    email: 'rajesh.nair@masterdev.infra',
    name: 'Rajesh Nair',
    title: 'Chief Project Director',
    role: 'PROJECT_DIRECTOR',
    department: 'National Highways & Logistics Division',
    avatarInitials: 'RN',
  },
  EXECUTIVE_CONTROLLER: {
    id: 'usr-fin-02',
    email: 'priya.sharma@masterdev.infra',
    name: 'Priya Sharma',
    title: 'Chief Financial Officer & Controller',
    role: 'EXECUTIVE_CONTROLLER',
    department: 'Capital Expenditure & EVM Audit',
    avatarInitials: 'PS',
  },
  SITE_SUPERVISOR: {
    id: 'usr-site-03',
    email: 'vikram.singh@masterdev.infra',
    name: 'Vikram Singh',
    title: 'Senior Resident Engineer',
    role: 'SITE_SUPERVISOR',
    department: 'Site Execution & Field Quality',
    avatarInitials: 'VS',
  },
  LEAD_RISK_ANALYST: {
    id: 'usr-risk-04',
    email: 'arjun.mehta@masterdev.infra',
    name: 'Dr. Arjun Mehta',
    title: 'Lead AI & Risk Intelligence Officer',
    role: 'LEAD_RISK_ANALYST',
    department: 'Predictive Analytics & Early Warning',
    avatarInitials: 'AM',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('aurum_auth_user');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading stored user', e);
    }
    // Default demo authenticated user
    return DEFAULT_USERS.PROJECT_DIRECTOR;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('aurum_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('aurum_auth_user');
    }
  }, [user]);

  const login = async (email: string): Promise<boolean> => {
    // Check if matching any role
    const matched = Object.values(DEFAULT_USERS).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setUser(matched);
      return true;
    }
    // Generic user fallback
    setUser({
      id: `usr-${Date.now()}`,
      email,
      name: email.split('@')[0].toUpperCase(),
      title: 'Infrastructure Project Officer',
      role: 'PROJECT_DIRECTOR',
      department: 'Infrastructure Delivery Taskforce',
      avatarInitials: email.substring(0, 2).toUpperCase(),
    });
    return true;
  };

  const loginAsRole = (role: UserRole) => {
    setUser(DEFAULT_USERS[role]);
  };

  const logout = () => {
    setUser(null);
  };

  const setRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role, title: DEFAULT_USERS[role].title });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        loginAsRole,
        logout,
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
