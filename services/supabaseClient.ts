import { createClient } from '@supabase/supabase-js';

// REPLACE THESE WITH YOUR ACTUAL SUPABASE CREDENTIALS
// You can find these in your Supabase Dashboard -> Settings -> API
const SUPABASE_URL = 'https://tidpuuyvgxkerjsshpgk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpZHB1dXl2Z3hrZXJqc3NocGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MDYwMDAsImV4cCI6MjA3OTk4MjAwMH0.2EZa-lsmuLgqxdocX6p4d0mMFU_6erBIe8Hm0hAD40s';
const isConfigured = !SUPABASE_URL.includes('tidpuuyvgxkerjsshpgk');

if (!isConfigured) {
    console.warn("Supabase credentials missing. Falling back to Local Storage mode.");
}

export const supabase = isConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const isSupabaseConfigured = () => isConfigured;