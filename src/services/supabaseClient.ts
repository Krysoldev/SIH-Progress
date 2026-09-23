import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Project } from '../types/project';

// Retrieve credentials from localStorage first, then fallback to env
export function getSavedSupabaseConfig() {
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('aurum_supabase_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('aurum_supabase_anon_key') : null;
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const url = (localUrl && localUrl.trim()) || envUrl;
  const anonKey = (localKey && localKey.trim()) || envKey;

  const isConfigured = Boolean(
    url &&
    anonKey &&
    url.startsWith('https://') &&
    url !== 'https://your-project.supabase.co' &&
    !url.includes('placeholder')
  );

  return { url, anonKey, isConfigured };
}

let activeClient: SupabaseClient | null = null;

export function initSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSavedSupabaseConfig();
  if (!isConfigured) {
    activeClient = null;
    return null;
  }

  try {
    activeClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return activeClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    activeClient = null;
    return null;
  }
}

// Initial initialization
initSupabaseClient();

export function getSupabase(): SupabaseClient | null {
  if (!activeClient) {
    return initSupabaseClient();
  }
  return activeClient;
}

// Exported client proxy and status flags for compatibility
export const supabase = getSupabase();
export const isSupabaseConfigured = getSavedSupabaseConfig().isConfigured;

export function checkIsSupabaseConfigured(): boolean {
  return getSavedSupabaseConfig().isConfigured;
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  if (url.trim()) {
    localStorage.setItem('aurum_supabase_url', url.trim());
  } else {
    localStorage.removeItem('aurum_supabase_url');
  }

  if (anonKey.trim()) {
    localStorage.setItem('aurum_supabase_anon_key', anonKey.trim());
  } else {
    localStorage.removeItem('aurum_supabase_anon_key');
  }

  const client = initSupabaseClient();
  return client;
}

export function clearSupabaseConfig() {
  localStorage.removeItem('aurum_supabase_url');
  localStorage.removeItem('aurum_supabase_anon_key');
  activeClient = null;
}

export async function testSupabaseConnection(customUrl?: string, customKey?: string): Promise<{
  success: boolean;
  message: string;
  latencyMs: number;
}> {
  const startTime = Date.now();
  let client: SupabaseClient | null = null;

  if (customUrl && customKey) {
    try {
      client = createClient(customUrl.trim(), customKey.trim());
    } catch (e: any) {
      return { success: false, message: `Client creation error: ${e.message}`, latencyMs: 0 };
    }
  } else {
    client = getSupabase();
  }

  if (!client) {
    return {
      success: false,
      message: 'Supabase credentials not configured. Please supply a valid URL and Anon Key.',
      latencyMs: 0,
    };
  }

  try {
    const { error } = await client.auth.getSession();
    const latency = Date.now() - startTime;

    if (error) {
      return {
        success: false,
        message: `Connection returned auth error: ${error.message}`,
        latencyMs: latency,
      };
    }

    return {
      success: true,
      message: 'Successfully established live connection to Supabase backend.',
      latencyMs: latency,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Network/host unreachable: ${err.message || 'Check project URL'}`,
      latencyMs: Date.now() - startTime,
    };
  }
}

export function getSupabaseStatus() {
  const { url, anonKey, isConfigured } = getSavedSupabaseConfig();
  return {
    configured: isConfigured,
    url: isConfigured ? url.replace(/https:\/\/(.{4}).*(\.supabase\.co)/, 'https://$1***$2') : 'Local Intelligence Engine (Offline Mode)',
    rawUrl: url,
    rawKey: anonKey,
    hasKey: Boolean(anonKey),
  };
}

/**
 * Sync projects and alerts to Supabase tables
 */
export async function syncProjectsToSupabase(projects: Project[]): Promise<{
  success: boolean;
  syncedCount: number;
  error?: string;
}> {
  const client = getSupabase();
  if (!client) {
    return { success: false, syncedCount: 0, error: 'Supabase is not configured' };
  }

  try {
    let synced = 0;
    for (const p of projects) {
      const { error: projError } = await client.from('projects').upsert({
        id: p.id,
        code: p.code,
        name: p.name,
        location: p.location,
        state: p.state,
        lat: p.lat,
        lng: p.lng,
        planned_cost: p.plannedCost,
        current_expenditure: p.currentExpenditure,
        physical_progress: p.physicalProgress,
        planned_duration: p.plannedDuration,
        elapsed_duration: p.elapsedDuration,
        status: p.status,
        risk_score: p.riskScore,
        category: p.category,
        contractor: p.contractor,
        manager: p.manager,
        description: p.description,
        last_update: new Date().toISOString(),
      });

      if (!projError) {
        synced++;
      } else {
        console.warn(`Error syncing project ${p.id}:`, projError);
      }

      // Sync alerts
      if (p.alerts && p.alerts.length > 0) {
        for (const a of p.alerts) {
          await client.from('alerts').upsert({
            id: a.id,
            project_id: p.id,
            project_name: p.name,
            alert_type: a.alertType,
            severity: a.severity,
            signal: a.signal,
            impact: a.impact,
            recommended_action: a.recommendedAction,
            status: a.status,
          });
        }
      }
    }

    return { success: true, syncedCount: synced };
  } catch (err: any) {
    return { success: false, syncedCount: 0, error: err.message };
  }
}

export const SUPABASE_SQL_SCHEMA = `-- ============================================================
-- MASTER DEV AURUM — SUPABASE POSTGRESQL SCHEMA
-- Execute in Supabase SQL Editor to initialize tables
-- ============================================================

-- 1. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  state TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  planned_cost NUMERIC NOT NULL,
  current_expenditure NUMERIC NOT NULL,
  physical_progress NUMERIC NOT NULL,
  planned_duration INTEGER NOT NULL,
  elapsed_duration INTEGER NOT NULL,
  status TEXT NOT NULL,
  risk_score INTEGER NOT NULL,
  category TEXT NOT NULL,
  contractor TEXT NOT NULL,
  manager TEXT NOT NULL,
  last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT
);

-- 2. Milestones Table
CREATE TABLE IF NOT EXISTS public.milestones (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  planned_date TEXT NOT NULL,
  actual_date TEXT,
  status TEXT NOT NULL,
  critical_path BOOLEAN DEFAULT FALSE,
  delay_months INTEGER DEFAULT 0,
  weightage NUMERIC DEFAULT 0
);

-- 3. Alerts Table
CREATE TABLE IF NOT EXISTS public.alerts (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  signal TEXT NOT NULL,
  impact TEXT NOT NULL,
  recommended_action TEXT NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'ACTIVE'
);

-- 4. Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- 5. Open Read Policies for Anonymous Access
CREATE POLICY "Public Read Projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public Read Milestones" ON public.milestones FOR SELECT USING (true);
CREATE POLICY "Public Read Alerts" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "Public Write Projects" ON public.projects FOR ALL USING (true);
CREATE POLICY "Public Write Milestones" ON public.milestones FOR ALL USING (true);
CREATE POLICY "Public Write Alerts" ON public.alerts FOR ALL USING (true);
`;
