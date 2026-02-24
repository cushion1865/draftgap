'use client';

import { useState, useEffect, useMemo } from 'react';
import { useT } from '@/lib/useT';
import { Champion } from '@/lib/types';
import { getChampionIconUrl, getDDragonVersionAsync } from '@/lib/data-dragon';
import { getPoolChampionIds, toggleInPool } from '@/lib/champion-pool';
import Header from '@/components/Header';

export default function PoolPage() {
	const t = useT();
	const [champions, setChampions] = useState<Champion[]>([]);
	const [poolIds, setPoolIds] = useState<string[]>([]);
	const [search, setSearch] = useState('');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setPoolIds(getPoolChampionIds());
	}, []);

	useEffect(() => {
		async function loadChampions() {
			try {
				const version = await getDDragonVersionAsync();
				const res = await fetch(
					`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
				);
				const data = await res.json();
				const champs: Champion[] = Object.values(data.data).map((c: any) => ({
					id: c.id,
					key: c.key,
					name: c.name,
					image: c.image.full,
					tags: c.tags,
				}));
				setChampions(champs.sort((a, b) => a.name.localeCompare(b.name)));
			} catch (error) {
				console.error('Failed to load champions:', error);
			} finally {
				setLoading(false);
			}
		}
		loadChampions();
	}, []);

	function handleToggle(championId: string) {
		const newPool = toggleInPool(championId);
		setPoolIds(newPool.map(e => e.championId));
	}

	const poolChampions = useMemo(
		() => champions.filter(c => poolIds.includes(c.id)),
		[champions, poolIds]
	);

	const filteredChampions = useMemo(
		() => champions.filter(c =>
			search === '' ||
			c.name.toLowerCase().includes(search.toLowerCase()) ||
			c.id.toLowerCase().includes(search.toLowerCase())
		),
		[champions, search]
	);

	return (
		<>
			<Header />
			<main className="container">
				<section className="hero" style={{ paddingBottom: 16 }}>
					<h1>{t('pool.title')}</h1>
					<p>{t('pool.subtitle')}</p>
				</section>

				{/* Selected Pool Display */}
				<div className="pool-page-header">
					<div className="pool-count">
						{t('pool.count', { count: poolIds.length })}
					</div>
				</div>

				<div className="pool-selected-grid">
					{poolChampions.length === 0 && (
						<span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
							{t('pool.emptyHint')}
						</span>
					)}
					{poolChampions.map(c => (
						<div
							key={c.id}
							className="pool-chip"
							onClick={() => handleToggle(c.id)}
							title={t('pool.removeHint', { name: c.name })}
						>
							<img src={getChampionIconUrl(c.image)} alt={c.name} />
							{c.name}
							<span style={{ marginLeft: 4, opacity: 0.5 }}>✕</span>
						</div>
					))}
				</div>

				{/* Search */}
				<div className="search-container">
					<span className="search-icon">🔍</span>
					<input
						type="text"
						className="search-input"
						placeholder={t('pool.searchPlaceholder')}
						value={search}
						onChange={e => setSearch(e.target.value)}
					/>
				</div>

				{/* Champion Grid */}
				{loading ? (
					<div className="loading-container">
						<div className="loading-spinner" />
					</div>
				) : (
					<div className="champion-grid">
						{filteredChampions.map(champion => (
							<div
								key={champion.id}
								className={`champion-card ${poolIds.includes(champion.id) ? 'in-pool' : ''}`}
								onClick={() => handleToggle(champion.id)}
								title={champion.name}
							>
								<img
									src={getChampionIconUrl(champion.image)}
									alt={champion.name}
									loading="lazy"
								/>
								<div className="champion-card-name">{champion.name}</div>
							</div>
						))}
					</div>
				)}
			</main>
		</>
	);
}
