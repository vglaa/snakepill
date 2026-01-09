import { createClient } from '@supabase/supabase-js';
import { config } from './config';

export const supabaseAdmin = createClient(
  config.supabase.url!,
  config.supabase.serviceKey!
);

export const supabase = createClient(
  config.supabase.url!,
  config.supabase.anonKey!
);

// Player operations
export async function getPlayer(walletAddress: string) {
  const { data, error } = await supabaseAdmin
    .from('players')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  return data;
}

export async function createPlayer(walletAddress: string, username: string | null = null) {
  const { data, error } = await supabaseAdmin
    .from('players')
    .insert({
      wallet_address: walletAddress,
      username: username
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePlayer(walletAddress: string, updates: Record<string, any>) {
  const { data, error } = await supabaseAdmin
    .from('players')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('wallet_address', walletAddress)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Game session operations
export async function createGameSession(playerId: string | null, walletAddress: string | null) {
  const { data, error } = await supabaseAdmin
    .from('game_sessions')
    .insert({
      player_id: playerId,
      wallet_address: walletAddress
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function endGameSession(sessionId: string, score: number, playtimeSeconds: number, pillsEaten: number, reason: string) {
  const { data, error } = await supabaseAdmin
    .from('game_sessions')
    .update({
      score,
      playtime_seconds: playtimeSeconds,
      pills_eaten: pillsEaten,
      ended_at: new Date().toISOString(),
      game_over_reason: reason
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Leaderboard operations
export async function getLeaderboard(limit = 100) {
  const { data, error } = await supabaseAdmin
    .from('leaderboard')
    .select('*')
    .order('score', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// Eligible players operations
export async function getEligiblePlayers() {
  const { data, error } = await supabaseAdmin
    .from('eligible_players')
    .select('*, players(*)')
    .eq('is_active', true);

  if (error) throw error;
  return data;
}

export async function setPlayerEligible(playerId: string, walletAddress: string, holdingUsd: number, totalPlaytime: number) {
  const { data, error } = await supabaseAdmin
    .from('eligible_players')
    .upsert({
      player_id: playerId,
      wallet_address: walletAddress,
      holding_usd: holdingUsd,
      total_playtime_seconds: totalPlaytime,
      is_active: true,
      last_verified_at: new Date().toISOString()
    }, {
      onConflict: 'wallet_address'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removePlayerEligibility(walletAddress: string) {
  const { error } = await supabaseAdmin
    .from('eligible_players')
    .update({ is_active: false })
    .eq('wallet_address', walletAddress);

  if (error) throw error;
}

// Online players operations
export async function updateOnlinePlayer(sessionId: string, walletAddress: string | null, isPlaying: boolean) {
  const { error } = await supabaseAdmin
    .from('online_players')
    .upsert({
      session_id: sessionId,
      wallet_address: walletAddress,
      is_playing: isPlaying,
      last_seen: new Date().toISOString()
    }, {
      onConflict: 'session_id'
    });

  if (error) throw error;
}

export async function removeOnlinePlayer(sessionId: string) {
  const { error } = await supabaseAdmin
    .from('online_players')
    .delete()
    .eq('session_id', sessionId);

  if (error) throw error;
}

export async function getOnlineCount() {
  const { count, error } = await supabaseAdmin
    .from('online_players')
    .select('*', { count: 'exact', head: true })
    .gte('last_seen', new Date(Date.now() - 2 * 60 * 1000).toISOString());

  if (error) throw error;
  return count || 0;
}

export async function cleanupOfflinePlayers() {
  const { error } = await supabaseAdmin
    .from('online_players')
    .delete()
    .lt('last_seen', new Date(Date.now() - 2 * 60 * 1000).toISOString());

  if (error) throw error;
}

// Donates operations
export async function getDonates(limit = 50) {
  const { data, error } = await supabaseAdmin
    .from('donates')
    .select('*')
    .order('amount_sol', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// Skins operations
export async function getSkins() {
  const { data, error } = await supabaseAdmin
    .from('skins')
    .select('*')
    .order('cost_points', { ascending: true });

  if (error) throw error;
  return data;
}

export async function buySkin(walletAddress: string, skinId: string) {
  const player = await getPlayer(walletAddress);
  if (!player) throw new Error('Player not found');

  const { data: skin, error: skinError } = await supabaseAdmin
    .from('skins')
    .select('*')
    .eq('id', skinId)
    .single();

  if (skinError) throw skinError;
  if (!skin) throw new Error('Skin not found');

  if (player.owned_skins && player.owned_skins.includes(skinId)) {
    throw new Error('Skin already owned');
  }

  if (player.total_points < skin.cost_points) {
    throw new Error('Not enough points');
  }

  const newOwnedSkins = [...(player.owned_skins || ['classic']), skinId];
  const newPoints = player.total_points - skin.cost_points;

  const { data, error } = await supabaseAdmin
    .from('players')
    .update({
      total_points: newPoints,
      owned_skins: newOwnedSkins,
      updated_at: new Date().toISOString()
    })
    .eq('wallet_address', walletAddress)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function equipSkin(walletAddress: string, skinId: string) {
  const player = await getPlayer(walletAddress);
  if (!player) throw new Error('Player not found');

  if (!player.owned_skins || !player.owned_skins.includes(skinId)) {
    throw new Error('Skin not owned');
  }

  const { data, error } = await supabaseAdmin
    .from('players')
    .update({
      current_skin: skinId,
      updated_at: new Date().toISOString()
    })
    .eq('wallet_address', walletAddress)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// System status
export async function getSystemStatus() {
  const { data, error } = await supabaseAdmin
    .from('system_status')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) throw error;
  return data;
}

export async function updateSystemStats() {
  await supabaseAdmin.rpc('update_system_stats');
}

// Get players with minimum playtime for eligibility check
export async function getPlayersWithMinPlaytime(minSeconds: number) {
  const { data, error } = await supabaseAdmin
    .from('players')
    .select('*')
    .gte('total_playtime_seconds', minSeconds);

  if (error) throw error;
  return data;
}
