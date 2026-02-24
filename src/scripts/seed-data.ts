/**
 * Seed script: generates realistic sample matchup data for development.
 * Run with: npx tsx src/scripts/seed-data.ts
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'matchups.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
	fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Create table
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
`);

// Champion IDs mapped to their typical roles
const CHAMPION_ROLES: Record<string, string[]> = {
	// Top laners
	Aatrox: ['top'], Camille: ['top'], Darius: ['top'], Fiora: ['top'],
	Gangplank: ['top'], Garen: ['top'], Gnar: ['top'], Gwen: ['top'],
	Illaoi: ['top'], Irelia: ['top', 'mid'], Jax: ['top'], Jayce: ['top', 'mid'],
	Kayle: ['top'], Kennen: ['top'], Kled: ['top'], Malphite: ['top'],
	Mordekaiser: ['top'], Nasus: ['top'], Olaf: ['top'], Ornn: ['top'],
	Pantheon: ['top', 'mid', 'support'], Poppy: ['top'], Quinn: ['top'],
	Renekton: ['top'], Riven: ['top'], Rumble: ['top'], Sett: ['top'],
	Shen: ['top'], Singed: ['top'], Sion: ['top'], TahmKench: ['top'],
	Teemo: ['top'], Trundle: ['top'], Tryndamere: ['top'], Urgot: ['top'],
	Volibear: ['top'], Yorick: ['top'],
	// Junglers
	Amumu: ['jungle'], BelVeth: ['jungle'], Diana: ['jungle'],
	Ekko: ['jungle', 'mid'], Elise: ['jungle'], Evelynn: ['jungle'],
	Fiddlesticks: ['jungle'], Graves: ['jungle'], Hecarim: ['jungle'],
	Ivern: ['jungle'], JarvanIV: ['jungle'], Karthus: ['jungle'],
	Kayn: ['jungle'], Khazix: ['jungle'], KindrED: ['jungle'],
	LeeSin: ['jungle'], Lillia: ['jungle'], MasterYi: ['jungle'],
	Nidalee: ['jungle'], Nocturne: ['jungle'], Nunu: ['jungle'],
	RekSai: ['jungle'], Rengar: ['jungle'], Sejuani: ['jungle'],
	Shaco: ['jungle'], Shyvana: ['jungle'], Skarner: ['jungle'],
	Udyr: ['jungle'], Vi: ['jungle'], Viego: ['jungle'],
	Warwick: ['jungle'], XinZhao: ['jungle'], Zac: ['jungle'],
	// Mid laners
	Ahri: ['mid'], Akali: ['mid'], Anivia: ['mid'], Annie: ['mid'],
	AurelionSol: ['mid'], Azir: ['mid'], Cassiopeia: ['mid'],
	Corki: ['mid'], Fizz: ['mid'], Galio: ['mid'], Kassadin: ['mid'],
	Katarina: ['mid'], LeBlanc: ['mid'], Lissandra: ['mid'], Lux: ['mid', 'support'],
	Malzahar: ['mid'], Neeko: ['mid'], Orianna: ['mid'], Qiyana: ['mid'],
	Ryze: ['mid'], Syndra: ['mid'], TaliyaH: ['mid'], Talon: ['mid'],
	TwistedFate: ['mid'], Veigar: ['mid'], VelKoz: ['mid', 'support'],
	Viktor: ['mid'], Vladimir: ['mid'], Xerath: ['mid', 'support'],
	Yasuo: ['mid', 'bottom'], Yone: ['mid', 'top'], Zed: ['mid'], Ziggs: ['mid'],
	Zoe: ['mid'],
	// Bot laners (ADC)
	Aphelios: ['bottom'], Ashe: ['bottom'], Caitlyn: ['bottom'],
	Draven: ['bottom'], Ezreal: ['bottom'], Jhin: ['bottom'],
	Jinx: ['bottom'], KaiSa: ['bottom'], Kalista: ['bottom'],
	KogMaw: ['bottom'], Lucian: ['bottom'], MissFortune: ['bottom'],
	Samira: ['bottom'], Sivir: ['bottom'], Tristana: ['bottom'],
	Twitch: ['bottom'], Varus: ['bottom'], Vayne: ['bottom', 'top'],
	Xayah: ['bottom'], Zeri: ['bottom'],
	// Supports
	Alistar: ['support'], Bard: ['support'], Blitzcrank: ['support'],
	Brand: ['support'], Braum: ['support'], Janna: ['support'],
	Karma: ['support'], Leona: ['support'], Lulu: ['support'],
	Milio: ['support'], Morgana: ['support'], Nami: ['support'],
	Nautilus: ['support'], Pyke: ['support'], Rakan: ['support'],
	Rell: ['support'], Renata: ['support'], Senna: ['support'],
	Seraphine: ['support', 'mid'], Sona: ['support'], Soraka: ['support'],
	Swain: ['support', 'mid'], Thresh: ['support'], Yuumi: ['support'],
	Zilean: ['support'], Zyra: ['support'],
};

const RANK_TIERS = ['iron', 'bronze', 'silver', 'gold', 'platinum', 'emerald', 'diamond', 'master', 'grandmaster', 'challenger'];
const PATCH = '15.3';

// Generate semi-realistic win rates with some variance
function generateWinRate(champA: string, champB: string): number {
	// Use a simple hash to make matchups deterministic but varied
	const hash = (champA + champB).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
	const base = 0.45 + (hash % 100) / 1000; // 0.45 - 0.55 range
	const variance = ((hash * 7) % 100 - 50) / 500; // ±0.1
	return Math.max(0.30, Math.min(0.70, base + variance));
}

console.log('🌱 Seeding matchup data...');

const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO matchups (champion_id, opponent_id, role, rank_tier, wins, games, patch, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
`);

const insertMany = db.transaction(() => {
	let count = 0;
	const champions = Object.keys(CHAMPION_ROLES);

	for (const champA of champions) {
		const rolesA = CHAMPION_ROLES[champA];
		for (const role of rolesA) {
			// Find opponents who play the same role
			const opponents = champions.filter(
				c => c !== champA && CHAMPION_ROLES[c].includes(role)
			);

			for (const champB of opponents) {
				for (const tier of RANK_TIERS) {
					const winRate = generateWinRate(champA, champB);
					// Higher tiers have fewer games
					const tierMultiplier = tier === 'challenger' ? 0.1 : tier === 'grandmaster' ? 0.2 :
						tier === 'master' ? 0.3 : tier === 'diamond' ? 0.5 : 1;
					const games = Math.floor((200 + Math.random() * 800) * tierMultiplier);
					const wins = Math.round(games * winRate);

					insertStmt.run(champA, champB, role, tier, wins, games, PATCH);
					count++;
				}
			}
		}
	}
	return count;
});

const total = insertMany();
console.log(`✅ Inserted ${total} matchup records`);

db.close();
console.log('🎉 Seed complete!');
