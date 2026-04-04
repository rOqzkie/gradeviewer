import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jtpaqovsnbzpjccrnmbe.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0cGFxb3ZzbmJ6cGpjY3JubWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwODc5OTEsImV4cCI6MjA5MDY2Mzk5MX0.2t0LwUKJeZ_oOQQmnMbCPYGlduwyqhOS_83eZZo3C0A';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Retrieve a value by key from the `kv_store` table.
 * Returns null if the key does not exist.
 */
export async function kvGet(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('kv_store')
    .select('value')
    .eq('key', key)
    .single();

  if (error || !data) return null;
  return data.value as string;
}

/**
 * Insert or update a key-value pair in the `kv_store` table.
 */
export async function kvSet(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('kv_store')
    .upsert({ key, value }, { onConflict: 'key' });

  if (error) throw new Error(error.message);
}

/**
 * Delete a key from the `kv_store` table.
 */
export async function kvDelete(key: string): Promise<void> {
  const { error } = await supabase
    .from('kv_store')
    .delete()
    .eq('key', key);

  if (error) throw new Error(error.message);
}

/**
 * List all key-value pairs in the `kv_store` table.
 */
export async function kvList(): Promise<{ key: string; value: string }[]> {
  const { data, error } = await supabase
    .from('kv_store')
    .select('key, value');

  if (error) throw new Error(error.message);
  return (data ?? []) as { key: string; value: string }[];
}
