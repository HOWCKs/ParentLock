import { supabase, supabaseConfigured } from './supabase';

export function normalizePairingCode(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .slice(0, 24);
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
