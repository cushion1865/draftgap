/**
 * Data Collection Script — Fetch real matchup data from Riot API.
 *
 * Usage:
 *   npx tsx src/scripts/collect-data.ts [options]
 *
 * Options (via environment or inline):
 *   --tier        Tier to collect (default: "GOLD")
 *   --division    Division within tier (default: "I")
 *   --pages       Number of league pages to fetch (default: 1, each ~200 players)
 *   --start-page  First page to fetch (default: 1). Use >1 to sample mid-LP players.
 *   --matches     Number of recent matches per player (default: 5)
 *   --apex        Collect from master+ instead of tier/division
 */

import {
	getLeagueEntries,
	getApexLeagueEntries,
	getMatchIds,
	getMatchDetail,
	extractMatchups,
	type LeagueEntry,
} from '../lib/riot-api';

import { upsertMatchup, isMatchProcessed, markMatchProcessed, getDb } from '../lib/db';
import { fetchAllChampions } from '../lib/data-dragon';

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

function getArg(name: string, defaultValue: string): string {
	const idx = process.argv.indexOf(`--${name}`);
	if (idx !== -1 && process.argv[idx + 1]) {
		return process.argv[idx + 1];
	}
	return defaultValue;
}

const TIER = getArg('tier', 'GOLD').toUpperCase();
const DIVISION = getArg('division', 'I').toUpperCase();
const PAGES = parseInt(getArg('pages', '1'), 10);
const START_PAGE = parseInt(getArg('start-page', '1'), 10);
const MATCHES_PER_PLAYER = parseInt(getArg('matches', '5'), 10);
const IS_APEX = process.argv.includes('--apex');

// ---------------------------------------------------------------------------
// Main collection logic
// ---------------------------------------------------------------------------

async function collectData() {
	console.log('');
	console.log('╔══════════════════════════════════════════════╗');
	console.log('║    DraftGap — Riot API Data Collector        ║');
	console.log('╚══════════════════════════════════════════════╝');
	console.log('');

	if (!process.env.RIOT_API_KEY) {
		console.error('❌ RIOT_API_KEY is not set. Please check .env.local');
		process.exit(1);
	}

	// Ensure DB is initialized
	getDb();

	// Build Data Dragon normalization map (lowercase → canonical ID)
	// Riot Match API の championName は Data Dragon ID と大文字化が異なる場合がある
	console.log('📚 Building champion ID normalization map from Data Dragon...');
	const champData = await fetchAllChampions('en_US');
	const champNormMap = new Map<string, string>();
	for (const champ of champData) {
		champNormMap.set(champ.id.toLowerCase(), champ.id);
	}
	console.log(`✅ Loaded ${champNormMap.size} champion IDs`);
	console.log('');

	function normalizeChampId(name: string): string {
		return champNormMap.get(name.toLowerCase()) ?? name;
	}

	// Step 1: Get player list (first fetch also validates the API key)
	console.log(`📋 Fetching players: ${IS_APEX ? 'Master+' : `${TIER} ${DIVISION}`}`);
	let entries: LeagueEntry[] = [];

	if (IS_APEX) {
		for (const tier of ['challenger', 'grandmaster', 'master'] as const) {
			const e = await getApexLeagueEntries(tier);
			console.log(`   ${tier}: ${e.length} players`);
			entries.push(...e);
		}
	} else {
		console.log(`   start-page: ${START_PAGE}, pages: ${PAGES}`);
		for (let page = START_PAGE; page < START_PAGE + PAGES; page++) {
			const e = await getLeagueEntries(TIER, DIVISION, page);
			console.log(`   Page ${page}: ${e.length} players`);
			if (e.length === 0) break;
			entries.push(...e);
		}
	}

	if (entries.length === 0) {
		console.error('❌ No players found. API key may be expired or invalid.');
		console.error('   Regenerate at: https://developer.riotgames.com/');
		process.exit(1);
	}

	console.log(`✅ Total players: ${entries.length}`);
	console.log('');

	// Step 2: Process each player
	// Note: league-v4 now returns puuid directly, so we skip summoner-v4 entirely
	let totalMatchesProcessed = 0;
	let totalMatchupsRecorded = 0;
	let skippedDuplicates = 0;
	let skippedNoPuuid = 0;

	for (let i = 0; i < entries.length; i++) {
		const entry = entries[i];
		const progress = `[${i + 1}/${entries.length}]`;

		// Use PUUID directly from league-v4 entry (no summoner-v4 needed)
		const puuid = entry.puuid;
		if (!puuid) {
			skippedNoPuuid++;
			continue;
		}

		// Get recent match IDs
		const matchIds = await getMatchIds(puuid, MATCHES_PER_PLAYER);
		if (matchIds.length === 0) continue;

		let playerMatchups = 0;

		for (const matchId of matchIds) {
			// Skip already-processed matches
			if (isMatchProcessed(matchId)) {
				skippedDuplicates++;
				continue;
			}

			// Get match detail
			const match = await getMatchDetail(matchId);
			if (!match) continue;

			// Only process Ranked Solo/Duo (queueId 420)
			if (match.info.queueId !== 420) {
				markMatchProcessed(matchId);
				continue;
			}

			// Extract patch from gameVersion (e.g., "15.3.123.456" → "15.3")
			const versionParts = match.info.gameVersion.split('.');
			const patch = `${versionParts[0]}.${versionParts[1]}`;

			// Determine rank tier for this data
			const rankTier = (IS_APEX
				? (entry.tier || 'master')
				: TIER
			).toLowerCase();

			// Extract matchups from this game
			const matchups = extractMatchups(match.info.participants);

			for (const mu of matchups) {
				upsertMatchup({
					championId: normalizeChampId(mu.championId),
					opponentId: normalizeChampId(mu.opponentId),
					role: mu.role,
					rankTier,
					wins: mu.won ? 1 : 0,
					games: 1,
					patch,
				});
				totalMatchupsRecorded++;
				playerMatchups++;
			}

			markMatchProcessed(matchId);
			totalMatchesProcessed++;
		}

		if (playerMatchups > 0) {
			console.log(`${progress} ${(entry.summonerId || entry.puuid || 'unknown').substring(0, 8)}... — ${playerMatchups} matchups from ${matchIds.length} games`);
		}
	}

	// Summary
	console.log('');
	console.log('═══════════════════════════════════════════════');
	console.log('📊 Collection Summary');
	console.log(`   Players processed:   ${entries.length}`);
	console.log(`   Missing PUUID:       ${skippedNoPuuid}`);
	console.log(`   Matches processed:   ${totalMatchesProcessed}`);
	console.log(`   Duplicate skipped:   ${skippedDuplicates}`);
	console.log(`   Matchups recorded:   ${totalMatchupsRecorded}`);
	console.log('═══════════════════════════════════════════════');
	console.log('');

	// Show DB stats
	const db = getDb();
	const matchupCount = (db.prepare('SELECT COUNT(*) as c FROM matchups').get() as any).c;
	const processedCount = (db.prepare('SELECT COUNT(*) as c FROM processed_matches').get() as any).c;
	console.log(`📦 Database: ${matchupCount} matchup rows, ${processedCount} processed matches`);
	console.log('🎉 Done!');
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

collectData().catch(err => {
	console.error('❌ Fatal error:', err);
	process.exit(1);
});
