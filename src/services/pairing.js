import { supabase, supabaseConfigured } from './supabase';

export function normalizePairingCode(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .slice(0, 24);
}

export async function ensureHousehold() {
  if (!supabaseConfigured || !supabase) return { ok: false, reason: 'backend-not-configured' };
  const { data, error } = await supabase.rpc('get_or_create_household');
  if (error) return { ok: false, reason: 'request-failed', error };
  return { ok: true, householdId: data };
}

export async function createPairingCode(householdId) {
  if (!supabaseConfigured || !supabase) return { ok: false, reason: 'backend-not-configured' };
  if (!householdId) return { ok: false, reason: 'household-required' };

  const { data, error } = await supabase.rpc('create_pairing_code', {
    target_household: householdId,
  });

  if (error) return { ok: false, reason: 'request-failed', error };
  return { ok: true, code: data };
}

export async function redeemPairingCode(value) {
  const code = normalizePairingCode(value);
  if (!code) return { ok: false, reason: 'empty-code' };
  if (!supabaseConfigured || !supabase) return { ok: false, reason: 'backend-not-configured' };

  const { data, error } = await supabase.rpc('redeem_pairing_code', {
    input_code: code,
  });

  if (error) return { ok: false, reason: 'request-failed', error };
  return { ok: true, data };
}
