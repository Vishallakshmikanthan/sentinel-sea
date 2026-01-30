import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Missing Supabase environment variables. Using mock data mode.');
    console.warn('To enable Supabase, create a .env file with:');
    console.warn('VITE_SUPABASE_URL=your-project-url');
    console.warn('VITE_SUPABASE_ANON_KEY=your-anon-key');
}

export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => !!supabase;
