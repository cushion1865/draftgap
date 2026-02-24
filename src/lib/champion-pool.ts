import { ChampionPoolEntry, Role } from './types';

const STORAGE_KEY = 'draftgap-champion-pool';

export function getChampionPool(): ChampionPoolEntry[] {
	if (typeof window === 'undefined') return [];
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch {
		return [];
	}
}

export function saveChampionPool(pool: ChampionPoolEntry[]): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(pool));
}

export function addToPool(championId: string, role?: Role): ChampionPoolEntry[] {
	const pool = getChampionPool();
	const existing = pool.find(e => e.championId === championId);
	if (existing) {
		if (role && !existing.roles.includes(role)) {
			existing.roles.push(role);
		}
	} else {
		pool.push({ championId, roles: role ? [role] : [] });
	}
	saveChampionPool(pool);
	return pool;
}

export function removeFromPool(championId: string): ChampionPoolEntry[] {
	const pool = getChampionPool().filter(e => e.championId !== championId);
	saveChampionPool(pool);
	return pool;
}

export function toggleInPool(championId: string): ChampionPoolEntry[] {
	const pool = getChampionPool();
	const exists = pool.find(e => e.championId === championId);
	if (exists) {
		return removeFromPool(championId);
	} else {
		return addToPool(championId);
	}
}

export function isInPool(championId: string): boolean {
	return getChampionPool().some(e => e.championId === championId);
}

export function getPoolChampionIds(): string[] {
	return getChampionPool().map(e => e.championId);
}
