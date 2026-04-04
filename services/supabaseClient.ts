import { createClient } from '@supabase/supabase-js';

// Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file (see .env.example)
const _env = (import.meta as unknown as { env: Record<string, string> }).env ?? {};

const SUPABASE_URL: string = _env.VITE_SUPABASE_URL || '';

const SUPABASE_ANON_KEY: string = _env.VITE_SUPABASE_ANON_KEY || '';

// Credentials are valid when the URL is a proper HTTPS Supabase URL and the key is a JWT
const isConfigured =
    SUPABASE_URL.startsWith('https://') &&
    SUPABASE_ANON_KEY.startsWith('eyJ') &&
    SUPABASE_ANON_KEY.length > 100;

if (!isConfigured) {
    console.warn('Supabase credentials are missing or invalid. Falling back to Local Storage mode.');
}

export const supabase = isConfigured
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

export const isSupabaseConfigured = () => isConfigured;