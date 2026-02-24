/**
 * fix-champion-ids.ts
 *
 * Riot Match v5 API の championName が Data Dragon の champion ID と
 * 異なる大文字化を使う場合があるため、DBに誤ったIDで蓄積されたデータを
 * 正しいIDにマージして修正する一回限りのマイグレーションスクリプト。
 *
 * Usage:
 *   npx tsx src/scripts/fix-champion-ids.ts
 */

import { getDb } from '../lib/db';

// Riot Match API が返す誤った championName → Data Dragon の正しい ID
const ID_FIXES: Record<string, string> = {
	BelVeth: 'Belveth',
	FiddleSticks: 'Fiddlesticks',
	KaiSa: 'Kaisa',
	KindrED: 'Kindred',
	LeBlanc: 'Leblanc',
	TaliyaH: 'Taliyah',
	VelKoz: 'Velkoz',
};

function fix() {
	const db = getDb();

	console.log('');
	console.log('╔══════════════════════════════════════════════╗');
	console.log('║    Champion ID Fix — DB Migration            ║');
	console.log('╚══════════════════════════════════════════════╝');
	console.log('');

	// 統計
	const statBefore = db.prepare('SELECT COUNT(*) as c FROM matchups').get() as any;
	console.log(`Before: ${statBefore.c} rows`);
	console.log('');

	const mergeAsChampion = db.prepare(`
		INSERT INTO matchups (champion_id, opponent_id, role, rank_tier, wins, games, patch, updated_at)
		SELECT ?, opponent_id, role, rank_tier, wins, games, patch, updated_at
		FROM matchups
		WHERE champion_id = ?
		ON CONFLICT(champion_id, opponent_id, role, rank_tier, patch)
		DO UPDATE SET
			wins = wins + excluded.wins,
			games = games + excluded.games,
			updated_at = datetime('now')
	`);

	const deleteAsChampion = db.prepare(`
		DELETE FROM matchups WHERE champion_id = ?
	`);

	const mergeAsOpponent = db.prepare(`
		INSERT INTO matchups (champion_id, opponent_id, role, rank_tier, wins, games, patch, updated_at)
		SELECT champion_id, ?, role, rank_tier, wins, games, patch, updated_at
		FROM matchups
		WHERE opponent_id = ?
		ON CONFLICT(champion_id, opponent_id, role, rank_tier, patch)
		DO UPDATE SET
			wins = wins + excluded.wins,
			games = games + excluded.games,
			updated_at = datetime('now')
	`);

	const deleteAsOpponent = db.prepare(`
		DELETE FROM matchups WHERE opponent_id = ?
	`);

	const countRows = db.prepare(`
		SELECT SUM(games) as total FROM matchups WHERE champion_id = ?
	`);

	for (const [wrongId, correctId] of Object.entries(ID_FIXES)) {
		const wrongGames = (db.prepare('SELECT SUM(games) as t FROM matchups WHERE champion_id = ?').get(wrongId) as any)?.t ?? 0;
		const correctGamesBefore = (countRows.get(correctId) as any)?.total ?? 0;

		if (wrongGames === 0) {
			console.log(`⚠️  ${wrongId}: no data found, skipping`);
			continue;
		}

		console.log(`🔧 ${wrongId} → ${correctId}`);
		console.log(`   Before: ${wrongId}=${wrongGames.toLocaleString()} games, ${correctId}=${correctGamesBefore.toLocaleString()} games`);

		// トランザクションで一括処理
		db.transaction(() => {
			// 1. champion_id 側をマージ
			mergeAsChampion.run(correctId, wrongId);
			deleteAsChampion.run(wrongId);

			// 2. opponent_id 側をマージ
			mergeAsOpponent.run(correctId, wrongId);
			deleteAsOpponent.run(wrongId);
		})();

		const correctGamesAfter = (countRows.get(correctId) as any)?.total ?? 0;
		console.log(`   After:  ${correctId}=${correctGamesAfter.toLocaleString()} games ✅`);
		console.log('');
	}

	const statAfter = db.prepare('SELECT COUNT(*) as c FROM matchups').get() as any;
	console.log(`After: ${statAfter.c} rows (reduced by ${statBefore.c - statAfter.c})`);
	console.log('');
	console.log('🎉 Migration complete!');

	// WAL チェックポイント
	db.pragma('wal_checkpoint(TRUNCATE)');
}

fix();
