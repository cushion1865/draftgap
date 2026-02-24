import { getDb } from '../lib/db';

const db = getDb();

// 1. Check how Ambessa appears in the DB
console.log('=== Ambessa in DB ===');
const ambessaRows = db.prepare(`
  SELECT champion_id, role, SUM(games) as total_games, SUM(wins) as total_wins, COUNT(*) as row_count
  FROM matchups 
  WHERE champion_id LIKE '%mbess%' OR champion_id LIKE '%MBESS%'
  GROUP BY champion_id, role
  ORDER BY total_games DESC
`).all() as any[];
console.log('Rows found:', ambessaRows.length);
ambessaRows.forEach(r => console.log(`  ${r.champion_id} (${r.role}): ${r.total_games} games, ${r.row_count} DB rows`));

// 2. Check opponent side too
console.log('\n=== Ambessa as opponent ===');
const ambessaOpp = db.prepare(`
  SELECT opponent_id, role, SUM(games) as total_games, COUNT(*) as row_count
  FROM matchups 
  WHERE opponent_id LIKE '%mbess%' OR opponent_id LIKE '%MBESS%'
  GROUP BY opponent_id, role
  ORDER BY total_games DESC
`).all() as any[];
console.log('Rows found:', ambessaOpp.length);
ambessaOpp.forEach(r => console.log(`  ${r.opponent_id} (${r.role}): ${r.total_games} games, ${r.row_count} DB rows`));

// 3. Check what the seed data uses as champion IDs (sample)
console.log('\n=== Sample champion_ids from DB (distinct, first 20) ===');
const sampleIds = db.prepare(`
  SELECT DISTINCT champion_id FROM matchups ORDER BY champion_id LIMIT 20
`).all() as any[];
sampleIds.forEach(r => console.log(`  ${r.champion_id}`));

// 4. Check the specific Ambessa top matchup pairs
console.log('\n=== Ambessa top matchup details ===');
const ambessaMatchups = db.prepare(`
  SELECT champion_id, opponent_id, role, SUM(games) as g, SUM(wins) as w
  FROM matchups 
  WHERE champion_id LIKE '%mbess%' AND role = 'top'
  GROUP BY champion_id, opponent_id, role
  ORDER BY g DESC
  LIMIT 10
`).all() as any[];
ambessaMatchups.forEach(r => console.log(`  ${r.champion_id} vs ${r.opponent_id}: ${r.g} games (${r.w} wins)`));
