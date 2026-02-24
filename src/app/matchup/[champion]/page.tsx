'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useT } from '@/lib/useT';
import { Champion, MatchupResult, Role, RankTier, ROLES, RANK_TIERS } from '@/lib/types';
import { getChampionIconUrl } from '@/lib/data-dragon';
import { getPoolChampionIds } from '@/lib/champion-pool';
import Header from '@/components/Header';
import RankSelector from '@/components/RankSelector';
import RoleIcon from '@/components/RoleIcon';

function getWinRateColor(winRate: number): string {
	if (winRate >= 0.53) return 'var(--win-high-gradient)';
	if (winRate >= 0.47) return 'var(--win-mid-gradient)';
	return 'var(--win-low-gradient)';
}

export default function MatchupPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const router = useRouter();
	const t = useT();

	const championId = params.champion as string;
	const initialRole = (searchParams.get('role') || 'top') as Role;
	// Validate rank from URL: '+' in query strings decodes as space, so validate the value
	const rawRank = searchParams.get('rank') || 'all';
	const validRankValues = RANK_TIERS.map(t => t.value);
	const initialRank = (validRankValues.includes(rawRank as RankTier) ? rawRank : 'all') as RankTier;

	const [role, setRole] = useState<Role>(initialRole);
	const [rank, setRank] = useState<RankTier>(initialRank);
	const [poolFilterActive, setPoolFilterActive] = useState(false);
	const [champion, setChampion] = useState<Champion | null>(null);
	const [matchups, setMatchups] = useState<MatchupResult[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [poolIds, setPoolIds] = useState<string[]>([]);

	useEffect(() => {
		setPoolIds(getPoolChampionIds());
	}, []);

	const fetchMatchups = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			let url = `/api/matchups?champion=${encodeURIComponent(championId)}&role=${encodeURIComponent(role)}&rank=${encodeURIComponent(rank)}`;
			if (poolFilterActive && poolIds.length > 0) {
				url += `&pool=${poolIds.join(',')}`;
			}
			const res = await fetch(url);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			setChampion(data.champion);

			// Mark pool champions
			const results = data.matchups.map((m: MatchupResult) => ({
				...m,
				isInPool: poolIds.includes(m.opponent.id),
			}));
			setMatchups(results);
		} catch (err) {
			console.error('Failed to load matchups:', err);
			setError(t('matchup.errorMessage'));
		} finally {
			setLoading(false);
		}
	}, [championId, role, rank, poolFilterActive, poolIds]);

	useEffect(() => {
		fetchMatchups();
	}, [fetchMatchups]);

	const emptyPoolActive = poolFilterActive && poolIds.length === 0;

	return (
		<>
			<Header />
			<main className="container">
				<button className="back-btn" onClick={() => router.back()}>
					{t('matchup.back')}
				</button>

				{/* Champion Header */}
				{champion && (
					<div className="matchup-header">
						<div className="matchup-champion-icon">
							<img
								src={getChampionIconUrl(champion.image)}
								alt={champion.name}
							/>
						</div>
						<div>
							<h1 className="matchup-title">{t('matchup.vsTitle', { name: champion.name })}</h1>
							<p className="matchup-subtitle">
								{t('matchup.subtitle', { name: champion.name, role: t(`roles.${role}`) })}
							</p>
							<div className="matchup-external-links">
								<a
									href={`https://www.op.gg/champions/${champion.name.toLowerCase().replace(/[\s'.]/g, '')}/counters`}
									target="_blank"
									rel="noopener noreferrer"
									className="external-link"
								>
									↗ OP.GG
								</a>
								<a
									href={`https://u.gg/lol/champions/${champion.name.toLowerCase().replace(/[\s'.]/g, '')}/counter`}
									target="_blank"
									rel="noopener noreferrer"
									className="external-link"
								>
									↗ U.GG
								</a>
							</div>
						</div>
					</div>
				)}

				{/* Controls */}
				<div className="matchup-controls">
					<div className="filter-bar" style={{ margin: 0 }}>
						{ROLES.map(r => (
							<button
								key={r.value}
								className={`filter-btn ${role === r.value ? 'active' : ''}`}
								onClick={() => setRole(r.value)}
							>
								<RoleIcon role={r.value} size={16} /> {t(`roles.${r.value}`)}
							</button>
						))}
					</div>

					<RankSelector value={rank} onChange={setRank} />

					<button
						className={`pool-toggle ${poolFilterActive ? 'active' : ''}`}
						onClick={() => setPoolFilterActive(!poolFilterActive)}
					>
						<div className="pool-toggle-indicator" />
						{t('matchup.myPoolOnly')}
						{poolIds.length > 0 && (
							<span style={{ opacity: 0.7, fontSize: '0.75rem' }}>
								({poolIds.length})
							</span>
						)}
					</button>
				</div>

				{/* Matchup List */}
				{loading ? (
					<div className="loading-container">
						<div className="loading-spinner" />
					</div>
				) : error ? (
					<div className="empty-state">
						<div className="empty-state-icon">⚠️</div>
						<p className="empty-state-text">{error}</p>
						<button
							className="filter-btn"
							style={{ marginTop: 16 }}
							onClick={fetchMatchups}
						>
							{t('matchup.retry')}
						</button>
					</div>
				) : emptyPoolActive ? (
					<div className="empty-state">
						<div className="empty-state-icon">⭐</div>
						<p className="empty-state-text">
							{t('matchup.emptyPoolTitle')}{' '}
							<button
								className="inline-link"
								onClick={() => router.push('/pool')}
							>
								{t('matchup.addToPool')}
							</button>
						</p>
					</div>
				) : matchups.length > 0 ? (
					<div className="matchup-list">
						{matchups.map((m, i) => {
							const winPercent = (m.winRate * 100).toFixed(1);
							const barColor = getWinRateColor(m.winRate);
							return (
								<div
									key={m.opponent.id || i}
									className={`matchup-row ${m.isInPool ? 'pool-highlight' : ''}`}
								>
									<div className="matchup-row-icon">
										<img
											src={getChampionIconUrl(m.opponent.image)}
											alt={m.opponent.name}
											loading="lazy"
										/>
									</div>
									<div className="matchup-row-name">
										{m.opponent.name}
										{m.isInPool && <span className="matchup-row-badge">{t('matchup.poolBadge')}</span>}
									</div>
									<div className="matchup-row-winrate">
										<div
											className="matchup-row-winrate-bar"
											style={{
												width: `${Math.max(m.winRate * 100, 20)}%`,
												background: barColor,
											}}
										/>
										<div className="matchup-row-winrate-text">{winPercent}%</div>
									</div>
									<div className="matchup-row-games">
										{t('matchup.games', { count: m.games.toLocaleString() })}
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="empty-state">
						<div className="empty-state-icon">📊</div>
						<p className="empty-state-text">
							{poolFilterActive ? t('matchup.noMatchupsPool') : t('matchup.noMatchups')}
						</p>
					</div>
				)}
			</main>
		</>
	);
}
