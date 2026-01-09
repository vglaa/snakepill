import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Player = {
  id: string;
  wallet_address: string;
  username: string | null;
  total_points: number;
  total_playtime_seconds: number;
  games_played: number;
  highest_score: number;
  current_skin: string;
  owned_skins: string[];
  is_eligible: boolean;
  eligible_since: string | null;
  created_at: string;
  updated_at: string;
};

export type LeaderboardEntry = {
  id: number;
  player_id: string;
  wallet_address: string;
  username: string | null;
  score: number;
  playtime_seconds: number;
  recorded_at: string;
};

export type Donate = {
  id: string;
  wallet_address: string;
  amount_sol: number;
  tx_signature: string;
  message: string | null;
  created_at: string;
};

export type Skin = {
  id: string;
  name: string;
  cost_points: number;
  description: string;
  color_primary: string;
  color_secondary: string;
  is_animated: boolean;
};

export type SystemStatus = {
  id: number;
  total_players: number;
  total_games: number;
  total_eligible: number;
  total_distributed_sol: number;
  updated_at: string;
};
