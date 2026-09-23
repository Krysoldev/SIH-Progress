import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, UserRole } from '../types/user';
import { getSupabase } from '../services/supabaseClient';

export interface StoredUserAccount extends UserProfile {
  passwordHash?: string;
  createdAt?: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { email: string; password: string; name: string; role: UserRole; department?: string }) => Promise<{ success: boolean; error?: string }>;
  loginAsRole: (role: UserRole) => void;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  switchAccount: (account: UserProfile) => void;
  deleteCustomAccount: (id: string) => void;
  savedAccounts: UserProfile[];
}

export const PRESET_USERS: Record<UserRole, UserProfile> = {
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

const CUSTOM_ACCOUNTS_KEY = 'aurum_custom_accounts_v1';
const AUTH_USER_KEY = 'aurum_auth_user';

function getStoredCustomAccounts(): StoredUserAccount[] {
  try {
    const raw = localStorage.getItem(CUSTOM_ACCOUNTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading custom accounts:', e);
  }
  return [];
}

function saveCustomAccounts(accounts: StoredUserAccount[]) {
  try {
    localStorage.setItem(CUSTOM_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.warn('Error saving custom accounts:', e);
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customAccounts, setCustomAccounts] = useState<StoredUserAccount[]>(getStoredCustomAccounts);
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading stored user', e);
    }
    return PRESET_USERS.PROJECT_DIRECTOR;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync session with Supabase auth listener if client is available
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const email = session.user.email || 'user@masterdev.infra';
        const metadata = session.user.user_metadata || {};
        setUser({
          id: session.user.id,
          email,
          name: metadata.name || email.split('@')[0].toUpperCase(),
          title: metadata.title || 'Infrastructure Project Officer',
          role: metadata.role || 'PROJECT_DIRECTOR',
          department: metadata.department || 'Infrastructure Taskforce',
          avatarInitials: (metadata.name ? metadata.name.substring(0, 2) : email.substring(0, 2)).toUpperCase(),
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  }, [user]);

  const login = async (email: string, password = ''): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Supabase Auth if configured
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password || 'TestPass123!',
        });

        if (!error && data.user) {
          const metadata = data.user.user_metadata || {};
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            name: metadata.name || cleanEmail.split('@')[0],
            title: metadata.title || 'Project Control Director',
            role: (metadata.role as UserRole) || 'PROJECT_DIRECTOR',
            department: metadata.department || 'Infrastructure Operations',
            avatarInitials: (metadata.name || cleanEmail).substring(0, 2).toUpperCase(),
          };
          setUser(profile);
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Supabase sign-in attempt notice:', err?.message || err);
      }
    }

    // 2. Check if matching preset personas
    const matchedPreset = Object.values(PRESET_USERS).find(
      u => u.email.toLowerCase() === cleanEmail
    );

    if (matchedPreset) {
      setUser(matchedPreset);
      setIsLoading(false);
      return { success: true };
    }

    // 3. Check custom registered accounts
    const matchedCustom = customAccounts.find(
      u => u.email.toLowerCase() === cleanEmail
    );

    if (matchedCustom) {
      if (matchedCustom.passwordHash && password && matchedCustom.passwordHash !== password) {
        setIsLoading(false);
        const err = 'Incorrect password for this registered account. Please check credentials.';
        setAuthError(err);
        return { success: false, error: err };
      }

      setUser(matchedCustom);
      setIsLoading(false);
      return { success: true };
    }

    // 4. Fallback to flexible local demo account if valid email format
    if (cleanEmail.includes('@') && cleanEmail.includes('.')) {
      const initials = cleanEmail.split('@')[0].slice(0, 2).toUpperCase();
      const profile: UserProfile = {
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        name: cleanEmail.split('@')[0].replace(/[._]/g, ' ').toUpperCase(),
        title: 'Project Intelligence Specialist',
        role: 'PROJECT_DIRECTOR',
        department: 'Infrastructure Delivery Taskforce',
        avatarInitials: initials,
      };
      setUser(profile);
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    const err = 'Account not found. Please register a new account or select a preset persona below.';
    setAuthError(err);
    return { success: false, error: err };
  };

  const signup = async (data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    department?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setAuthError(null);
    const cleanEmail = data.email.trim().toLowerCase();

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setIsLoading(false);
      const err = 'Please enter a valid work email address.';
      setAuthError(err);
      return { success: false, error: err };
    }

    if (!data.name || data.name.trim().length < 2) {
      setIsLoading(false);
      const err = 'Please provide your full identity or title.';
      setAuthError(err);
      return { success: false, error: err };
    }

    const initials = data.name.trim().slice(0, 2).toUpperCase() || cleanEmail.slice(0, 2).toUpperCase();
    const newProfile: StoredUserAccount = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      name: data.name.trim(),
      title: PRESET_USERS[data.role]?.title || 'Infrastructure Project Officer',
      role: data.role,
      department: data.department?.trim() || 'Infrastructure Delivery Taskforce',
      avatarInitials: initials,
      passwordHash: data.password,
      createdAt: new Date().toISOString(),
    };

    // Attempt Supabase signup if configured
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: authData, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: data.password,
          options: {
            data: {
              name: data.name,
              role: data.role,
              department: data.department || 'Infrastructure Delivery',
              title: newProfile.title,
            },
          },
        });

        if (error) {
          console.warn('Supabase signup notice:', error.message);
        } else if (authData.user) {
          newProfile.id = authData.user.id;
        }
      } catch (err: any) {
        console.warn('Supabase signup exception:', err);
      }
    }

    // Save to custom accounts list
    const updatedAccounts = [...customAccounts.filter(a => a.email.toLowerCase() !== cleanEmail), newProfile];
    setCustomAccounts(updatedAccounts);
    saveCustomAccounts(updatedAccounts);

    setUser(newProfile);
    setIsLoading(false);
    return { success: true };
  };

  const loginAsRole = useCallback((role: UserRole) => {
    setUser(PRESET_USERS[role]);
    setAuthError(null);
  }, []);

  const switchAccount = useCallback((account: UserProfile) => {
    setUser(account);
    setAuthError(null);
  }, []);

  const deleteCustomAccount = useCallback((id: string) => {
    const updated = customAccounts.filter(a => a.id !== id);
    setCustomAccounts(updated);
    saveCustomAccounts(updated);
    if (user?.id === id) {
      setUser(PRESET_USERS.PROJECT_DIRECTOR);
    }
  }, [customAccounts, user]);

  const logout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }
    setUser(null);
  };

  const setRole = (role: UserRole) => {
    if (user) {
      setUser({
        ...user,
        role,
        title: PRESET_USERS[role]?.title || user.title,
      });
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      ...updates,
      avatarInitials: updates.name ? updates.name.slice(0, 2).toUpperCase() : user.avatarInitials,
    };

    setUser(updatedUser);

    // If it's a custom account, persist updates
    const existingIndex = customAccounts.findIndex(a => a.id === user.id || a.email.toLowerCase() === user.email.toLowerCase());
    if (existingIndex !== -1) {
      const updatedList = [...customAccounts];
      updatedList[existingIndex] = { ...updatedList[existingIndex], ...updates };
      setCustomAccounts(updatedList);
      saveCustomAccounts(updatedList);
    }

    // If Supabase is active, update user metadata
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.updateUser({
          data: {
            name: updatedUser.name,
            role: updatedUser.role,
            department: updatedUser.department,
            title: updatedUser.title,
          },
        });
      } catch (err) {
        console.warn('Supabase profile sync error:', err);
      }
    }
  };

  const allSavedAccounts = [
    ...Object.values(PRESET_USERS),
    ...customAccounts,
  ];

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        authError,
        login,
        signup,
        loginAsRole,
        switchAccount,
        deleteCustomAccount,
        logout,
        setRole,
        updateProfile,
        savedAccounts: allSavedAccounts,
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
