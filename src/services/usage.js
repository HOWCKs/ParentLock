import { supabase, supabaseConfigured } from './supabase';

export async function listUsageRules(householdId) {
  if (!supabaseConfigured || !supabase || !householdId) return { ok: false, rules: [], reason: 'not-configured' };
  const { data, error } = await supabase
    .from('usage_rules')
    .select('id, device_id, app_label, package_name, daily_limit_minutes, blocked, schedule_start, schedule_end, active')
    .eq('household_id', householdId)
    .eq('active', true)
    .order('app_label');
  if (error) return { ok: false, rules: [], reason: 'request-failed', error };
  return { ok: true, rules: data || [] };
}
