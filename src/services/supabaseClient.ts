import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

let supabaseInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.warn('Supabase initialization error, falling back to local intelligence mode:', error);
  }
}

export const supabase = supabaseInstance;

export function getSupabaseStatus() {
  return {
    configured: isSupabaseConfigured,
    url: isSupabaseConfigured ? supabaseUrl.replace(/https:\/\/(.{4}).*(\.supabase\.co)/, 'https://$1***$2') : 'Local Intelligence Engine (Offline / Synthetic Mode)',
    hasKey: Boolean(supabaseAnonKey),
  };
}
