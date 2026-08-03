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

export async function createEmailInvite(email) {
  if (!supabaseConfigured || !supabase) return { ok: false, reason: 'not-configured' };
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail.includes('@')) return { ok: false, reason: 'invalid-email' };
  const { data, error } = await supabase.rpc('create_email_invite', {
    input_email: normalizedEmail,
  });
  if (error) return { ok: false, reason: 'request-failed', error };
  return { ok: true, data };
}

export async function listMyEmailInvites() {
  if (!supabaseConfigured || !supabase) return { ok: false, invites: [], reason: 'not-configured' };
  const { data, error } = await supabase.rpc('list_my_email_invites');
  if (error) return { ok: false, invites: [], reason: 'request-failed', error };
  return { ok: true, invites: data || [] };
}

export async function acceptEmailInvite(inviteId) {
  if (!supabaseConfigured || !supabase || !inviteId) return { ok: false, reason: 'not-configured' };
  const { data, error } = await supabase.rpc('accept_email_invite', {
    input_invite_id: inviteId,
  });
  if (error) return { ok: false, reason: 'request-failed', error };
  return { ok: data === true, data };
}

export async function listPendingPairingRequests(householdId) {
  if (!supabaseConfigured || !supabase || !householdId) return { ok: false, requests: [], reason: 'not-configured' };
  const { data, error } = await supabase
    .from('pairing_requests')
    .select('id, household_id, requester_id, status, created_at')
    .eq('household_id', householdId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) return { ok: false, requests: [], reason: 'request-failed', error };
  return { ok: true, requests: data || [] };
}

export async function listConnectedDevices(householdId) {
  if (!supabaseConfigured || !supabase || !householdId) return { ok: false, devices: [], reason: 'not-configured' };
  const { data, error } = await supabase
    .from('devices')
    .select('id, household_id, user_id, role, label, platform, battery_percent, connection_type, last_seen_at, last_status_at, created_at')
    .eq('household_id', householdId)
    .order('created_at', { ascending: true });
  if (error) return { ok: false, devices: [], reason: 'request-failed', error };
  return { ok: true, devices: data || [] };
}

export async function acceptPairingRequest(requestId) {
  if (!supabaseConfigured || !supabase || !requestId) return { ok: false, reason: 'not-configured' };
  const { data, error } = await supabase.rpc('accept_pairing_request', {
    input_request_id: requestId,
  });
  if (error) return { ok: false, reason: 'request-failed', error };
  return { ok: data === true, data };
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
