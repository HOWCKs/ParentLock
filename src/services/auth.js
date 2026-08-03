import { supabase, supabaseConfigured } from './supabase';

export async function getCurrentSession() {
  if (!supabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signInWithPassword(email, password) {
  if (!supabaseConfigured || !supabase) return { data: null, error: new Error('backend-not-configured') };
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithPassword(email, password) {
  if (!supabaseConfigured || !supabase) return { data: null, error: new Error('backend-not-configured') };
  return supabase.auth.signUp({ email, password });
}

export async function signOut() {
  if (!supabaseConfigured || !supabase) return;
  await supabase.auth.signOut();
}
