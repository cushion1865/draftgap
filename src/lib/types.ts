// Champion data from Data Dragon
export interface Champion {
  id: string;       // e.g. "Aatrox"
  key: string;      // e.g. "266"
  name: string;     // Display name (localized)
  image: string;    // Icon filename
  tags: string[];   // e.g. ["Fighter", "Tank"]
}

// Matchup statistics
export interface MatchupData {
  championId: string;
  opponentId: string;
  role: Role;
  rankTier: RankTier;
  wins: number;
  games: number;
  winRate: number;
  patch: string;
}

// Matchup result for API response
export interface MatchupResult {
  opponent: Champion;
  winRate: number;
  games: number;
  isInPool: boolean;
}

// API response
export interface MatchupResponse {
  champion: Champion;
  role: Role;
  rankTier: RankTier;
  matchups: MatchupResult[];
}

// Roles
export type Role = 'top' | 'jungle' | 'mid' | 'bottom' | 'support';

// Rank tiers (individual + compound "X+" filters)
export type RankTier =
  | 'all'
  | 'iron'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'emerald'
  | 'diamond'
  | 'master'
  | 'grandmaster'
  | 'challenger'
  | 'gold+'
  | 'platinum+'
  | 'emerald+'
  | 'diamond+'
  | 'master+';

// Ordered rank hierarchy (lowest to highest)
const RANK_ORDER = ['iron', 'bronze', 'silver', 'gold', 'platinum', 'emerald', 'diamond', 'master', 'grandmaster', 'challenger'] as const;

/** Expand a RankTier to the list of individual rank_tier values it represents */
export function expandRankTier(tier: RankTier): string[] | null {
  if (tier === 'all') return null; // null = no filter
  if (tier.endsWith('+')) {
    const base = tier.slice(0, -1) as typeof RANK_ORDER[number];
    const idx = RANK_ORDER.indexOf(base);
    if (idx === -1) return null;
    return RANK_ORDER.slice(idx) as unknown as string[];
  }
  return [tier]; // single tier
}

// Champion pool entry
export interface ChampionPoolEntry {
  championId: string;
  roles: Role[];
}

export const ROLES: { value: Role; label: string; icon: string }[] = [
  { value: 'top', label: 'Top', icon: '🗡️' },
  { value: 'jungle', label: 'Jungle', icon: '🌿' },
  { value: 'mid', label: 'Mid', icon: '⚡' },
  { value: 'bottom', label: 'Bottom', icon: '🏹' },
  { value: 'support', label: 'Support', icon: '🛡️' },
];

export const RANK_TIERS: { value: RankTier; label: string; separator?: boolean }[] = [
  { value: 'all', label: 'All Ranks' },
  // Compound "X+" filters
  { value: 'gold+', label: 'Gold+', separator: true },
  { value: 'platinum+', label: 'Platinum+' },
  { value: 'emerald+', label: 'Emerald+' },
  { value: 'diamond+', label: 'Diamond+' },
  { value: 'master+', label: 'Master+' },
  // Individual tiers
  { value: 'iron', label: 'Iron', separator: true },
  { value: 'bronze', label: 'Bronze' },
  { value: 'silver', label: 'Silver' },
  { value: 'gold', label: 'Gold' },
  { value: 'platinum', label: 'Platinum' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'master', label: 'Master' },
  { value: 'grandmaster', label: 'Grandmaster' },
  { value: 'challenger', label: 'Challenger' },
];
