import Database from 'better-sqlite3';
import path from 'path';
import { MatchupData, RankTier, Role, expandRankTier } from './types';

const DB_PATH = path.join(process.cwd(), 'data', 'matchups.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
	if (!db) {
		const isVercel = process.env.VERCEL === '1';
		if (isVercel) {
			// Vercel filesystem is read-only — open in readonly mode, skip WAL/init
			db = new Database(DB_PATH, { readonly: true });
		} else {
			db = new Database(DB_PATH);
			db.pragma('journal_mode = WAL');
			initDb(db);
		}
	}
	return db;
}

function initDb(db: Database.Database) {
	db.exec(`
    CREATE TABLE IF NOT EXISTS matchups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      champion_id TEXT NOT NULL,
      opponent_id TEXT NOT NULL,
      role TEXT NOT NULL,
      rank_tier TEXT NOT NULL,
      wins INTEGER NOT NULL DEFAULT 0,
      games INTEGER NOT NULL DEFAULT 0,
      patch TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(champion_id, opponent_id, role, rank_tier, patch)
    );
    CREATE INDEX IF NOT EXISTS idx_matchups_lookup 
      ON matchups(champion_id, role, rank_tier);
    CREATE INDEX IF NOT EXISTS idx_matchups_opponent 
      ON matchups(opponent_id, role, rank_tier);

    CREATE TABLE IF NOT EXISTS processed_matches (
      match_id TEXT PRIMARY KEY,
      processed_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export function isMatchProcessed(matchId: string): boolean {
	const db = getDb();
	const row = db.prepare('SELECT 1 FROM processed_matches WHERE match_id = ?').get(matchId);
	return !!row;
}

export function markMatchProcessed(matchId: string): void {
	const db = getDb();
	db.prepare('INSERT OR IGNORE INTO processed_matches (match_id) VALUES (?)').run(matchId);
}

export interface MatchupQueryResult {
	opponent_id: string;
	wins: number;
	games: number;
	win_rate: number;
}

export function getMatchups(
	championId: string,
	role: Role,
	rankTier: RankTier,
	poolFilter?: string[]
): MatchupQueryResult[] {
	const db = getDb();

	let query = `
    SELECT 
      opponent_id,
      SUM(wins) as wins,
      SUM(games) as games,
      ROUND(CAST(SUM(wins) AS REAL) / NULLIF(SUM(games), 0), 4) as win_rate
    FROM matchups
    WHERE champion_id = ?
      AND role = ?
  `;
	const params: any[] = [championId, role];

	// Expand rank tier (handles 'all', single tiers, and compound 'X+' tiers)
	const tiers = expandRankTier(rankTier);
	if (tiers !== null) {
		const placeholders = tiers.map(() => '?').join(',');
		query += ` AND rank_tier IN (${placeholders})`;
		params.push(...tiers);
	}

	if (poolFilter && poolFilter.length > 0) {
		const placeholders = poolFilter.map(() => '?').join(',');
		query += ` AND opponent_id IN (${placeholders})`;
		params.push(...poolFilter);
	}

	query += `
    GROUP BY opponent_id
    HAVING SUM(games) >= 10
    ORDER BY win_rate DESC
  `;

	return db.prepare(query).all(...params) as MatchupQueryResult[];
}

export function upsertMatchup(data: {
	championId: string;
	opponentId: string;
	role: Role;
	rankTier: string;
	wins: number;
	games: number;
	patch: string;
}) {
	const db = getDb();
	const stmt = db.prepare(`
    INSERT INTO matchups (champion_id, opponent_id, role, rank_tier, wins, games, patch, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(champion_id, opponent_id, role, rank_tier, patch)
    DO UPDATE SET 
      wins = wins + excluded.wins,
      games = games + excluded.games,
      updated_at = datetime('now')
  `);
	stmt.run(data.championId, data.opponentId, data.role, data.rankTier, data.wins, data.games, data.patch);
}
