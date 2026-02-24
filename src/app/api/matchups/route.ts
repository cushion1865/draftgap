import { NextRequest, NextResponse } from 'next/server';
import { getMatchups } from '@/lib/db';
import { fetchAllChampions } from '@/lib/data-dragon';
import { Role, RankTier, MatchupResult, Champion } from '@/lib/types';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const championId = searchParams.get('champion');
		const role = (searchParams.get('role') || 'top') as Role;
		const rankTier = (searchParams.get('rank') || 'all') as RankTier;
		const poolParam = searchParams.get('pool');

		if (!championId) {
			return NextResponse.json({ error: 'champion parameter is required' }, { status: 400 });
		}

		// Parse pool filter
		const poolFilter = poolParam ? poolParam.split(',').filter(Boolean) : undefined;

		// Get matchup data from DB
		const dbResults = getMatchups(championId, role, rankTier, poolFilter);

		// Get champion data for display
		const champions = await fetchAllChampions('en_US');
		const champMap = new Map<string, Champion>();
		champions.forEach(c => champMap.set(c.id, c));

		const champion = champMap.get(championId);
		if (!champion) {
			return NextResponse.json({ error: 'Champion not found' }, { status: 404 });
		}

		// Build response
		const matchups: MatchupResult[] = dbResults.map(r => {
			const opponent = champMap.get(r.opponent_id);
			return {
				opponent: opponent || { id: r.opponent_id, key: '0', name: r.opponent_id, image: '', tags: [] },
				winRate: r.win_rate,
				games: r.games,
				isInPool: poolFilter ? poolFilter.includes(r.opponent_id) : false,
			};
		});

		return NextResponse.json({
			champion,
			role,
			rankTier,
			matchups,
		});
	} catch (error) {
		console.error('Matchup API error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
