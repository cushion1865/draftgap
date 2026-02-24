/**
 * Riot Games API Client with rate limiting and retry logic.
 *
 * Rate limits (Development key):
 *   - 20 requests per second
 *   - 100 requests per 2 minutes
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config(); // Also load .env as fallback
import { Role } from './types';

const API_KEY = process.env.RIOT_API_KEY || '';
const PLATFORM = process.env.RIOT_REGION || 'jp1'; // jp1, na1, kr, etc.
const ROUTING = process.env.RIOT_ROUTING || 'asia'; // asia, americas, europe

const PLATFORM_BASE = `https://${PLATFORM}.api.riotgames.com`;
const ROUTING_BASE = `https://${ROUTING}.api.riotgames.com`;

// ---------------------------------------------------------------------------
// Rate Limiter
// ---------------------------------------------------------------------------

let requestTimestamps: number[] = [];
const SHORT_WINDOW = 1000;       // 1 second
const SHORT_LIMIT = 18;          // stay under 20/s
const LONG_WINDOW = 120_000;     // 2 minutes
const LONG_LIMIT = 95;           // stay under 100/2min
const MIN_INTERVAL_MS = 70;      // minimum gap between requests

async function waitForRateLimit(): Promise<void> {
	const now = Date.now();

	// Purge old timestamps
	requestTimestamps = requestTimestamps.filter(t => now - t < LONG_WINDOW);

	// Check long window
	if (requestTimestamps.length >= LONG_LIMIT) {
		const oldest = requestTimestamps[0];
		const waitMs = LONG_WINDOW - (now - oldest) + 500;
		console.log(`⏳ Long rate limit reached — waiting ${(waitMs / 1000).toFixed(1)}s`);
		await sleep(waitMs);
		requestTimestamps = requestTimestamps.filter(t => Date.now() - t < LONG_WINDOW);
	}

	// Check short window
	const recentCount = requestTimestamps.filter(t => now - t < SHORT_WINDOW).length;
	if (recentCount >= SHORT_LIMIT) {
		await sleep(SHORT_WINDOW);
	}

	// Ensure minimum interval
	if (requestTimestamps.length > 0) {
		const last = requestTimestamps[requestTimestamps.length - 1];
		const elapsed = Date.now() - last;
		if (elapsed < MIN_INTERVAL_MS) {
			await sleep(MIN_INTERVAL_MS - elapsed);
		}
	}
}

function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Core fetch with rate limiting + retry
// ---------------------------------------------------------------------------

async function riotFetch<T>(url: string, maxRetries = 3): Promise<T | null> {
	for (let attempt = 0; attempt < maxRetries; attempt++) {
		await waitForRateLimit();
		requestTimestamps.push(Date.now());

		try {
			const res = await fetch(url, {
				headers: { 'X-Riot-Token': API_KEY },
			});

			if (res.status === 200) {
				return (await res.json()) as T;
			}

			if (res.status === 429) {
				const retryAfter = parseInt(res.headers.get('Retry-After') || '10', 10);
				console.warn(`⚠️ 429 Rate limited — retrying in ${retryAfter}s (attempt ${attempt + 1})`);
				await sleep(retryAfter * 1000 + 500);
				continue;
			}

			if (res.status === 403) {
				console.error('❌ 403 Forbidden — API key may be expired. Regenerate at https://developer.riotgames.com/');
				return null;
			}

			if (res.status === 404) {
				return null; // Data not found is acceptable
			}

			console.warn(`⚠️ HTTP ${res.status} for ${url} — retrying (${attempt + 1}/${maxRetries})`);
			await sleep(2000 * (attempt + 1));
		} catch (err: any) {
			console.warn(`⚠️ Network error: ${err.message} — retrying (${attempt + 1}/${maxRetries})`);
			await sleep(3000 * (attempt + 1));
		}
	}

	console.error(`❌ Failed after ${maxRetries} attempts: ${url}`);
	return null;
}

// ---------------------------------------------------------------------------
// League-v4: Get ranked players by tier
// ---------------------------------------------------------------------------

export interface LeagueEntry {
	leagueId: string;
	summonerId: string;
	puuid: string;
	queueType: string;
	tier: string;
	rank: string;
	leaguePoints: number;
	wins: number;
	losses: number;
}

/**
 * Get league entries for a specific tier/division.
 * Works for IRON through DIAMOND.
 */
export async function getLeagueEntries(
	tier: string,
	division: string = 'I',
	page: number = 1
): Promise<LeagueEntry[]> {
	const url = `${PLATFORM_BASE}/lol/league/v4/entries/RANKED_SOLO_5x5/${tier}/${division}?page=${page}`;
	const result = await riotFetch<LeagueEntry[]>(url);
	return result || [];
}

/**
 * Get master+ league entries (different endpoint).
 */
export async function getApexLeagueEntries(
	tier: 'master' | 'grandmaster' | 'challenger'
): Promise<LeagueEntry[]> {
	const endpoint = tier === 'challenger' ? 'challengerleagues' :
		tier === 'grandmaster' ? 'grandmasterleagues' :
			'masterleagues';
	const url = `${PLATFORM_BASE}/lol/league/v4/${endpoint}/by-queue/RANKED_SOLO_5x5`;
	const result = await riotFetch<{ entries: LeagueEntry[] }>(url);
	return result?.entries || [];
}

// ---------------------------------------------------------------------------
// Summoner-v4: Get PUUID from summoner ID
// ---------------------------------------------------------------------------

interface SummonerDto {
	id: string;
	accountId: string;
	puuid: string;
	profileIconId: number;
	revisionDate: number;
	summonerLevel: number;
}

export async function getSummonerPuuid(summonerId: string): Promise<string | null> {
	const url = `${PLATFORM_BASE}/lol/summoner/v4/summoners/${summonerId}`;
	const result = await riotFetch<SummonerDto>(url);
	return result?.puuid || null;
}

// ---------------------------------------------------------------------------
// Match-v5: Get match IDs and match details
// ---------------------------------------------------------------------------

/**
 * Get recent ranked match IDs for a player.
 */
export async function getMatchIds(
	puuid: string,
	count: number = 5
): Promise<string[]> {
	const url = `${ROUTING_BASE}/lol/match/v5/matches/by-puuid/${puuid}/ids?type=ranked&count=${count}`;
	const result = await riotFetch<string[]>(url);
	return result || [];
}

/**
 * Match participant data (subset of fields we care about).
 */
export interface MatchParticipant {
	puuid: string;
	championId: number;
	championName: string;
	teamId: number;       // 100 = blue, 200 = red
	teamPosition: string; // TOP, JUNGLE, MIDDLE, BOTTOM, UTILITY
	win: boolean;
}

export interface MatchInfo {
	gameId: number;
	gameDuration: number;
	gameVersion: string;
	queueId: number;
	participants: MatchParticipant[];
}

export interface MatchDetail {
	metadata: { matchId: string };
	info: MatchInfo;
}

/**
 * Get full match detail.
 */
export async function getMatchDetail(matchId: string): Promise<MatchDetail | null> {
	const url = `${ROUTING_BASE}/lol/match/v5/matches/${matchId}`;
	return riotFetch<MatchDetail>(url);
}

// ---------------------------------------------------------------------------
// Matchup extraction helpers
// ---------------------------------------------------------------------------

/** Position mapping from API values to our role type */
const POSITION_TO_ROLE: Record<string, Role> = {
	TOP: 'top',
	JUNGLE: 'jungle',
	MIDDLE: 'mid',
	BOTTOM: 'bottom',
	UTILITY: 'support',
};

export interface ExtractedMatchup {
	championId: string;   // champion name (Data Dragon ID)
	opponentId: string;
	role: Role;
	won: boolean;
}

/**
 * Extract lane matchup pairs from a match's participants.
 * Pairs players from opposing teams who share the same teamPosition.
 */
export function extractMatchups(participants: MatchParticipant[]): ExtractedMatchup[] {
	const blue = participants.filter(p => p.teamId === 100);
	const red = participants.filter(p => p.teamId === 200);
	const matchups: ExtractedMatchup[] = [];

	for (const bluePlayer of blue) {
		const position = bluePlayer.teamPosition;
		if (!position || !POSITION_TO_ROLE[position]) continue;

		const redPlayer = red.find(r => r.teamPosition === position);
		if (!redPlayer) continue;

		const role = POSITION_TO_ROLE[position];

		// Blue vs Red
		matchups.push({
			championId: bluePlayer.championName,
			opponentId: redPlayer.championName,
			role,
			won: bluePlayer.win,
		});

		// Red vs Blue (inverse)
		matchups.push({
			championId: redPlayer.championName,
			opponentId: bluePlayer.championName,
			role,
			won: redPlayer.win,
		});
	}

	return matchups;
}
