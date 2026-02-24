import { Champion } from './types';

const DDRAGON_BASE = 'https://ddragon.leagueoflegends.com';
const FALLBACK_VERSION = process.env.NEXT_PUBLIC_DDRAGON_VERSION || '15.3.1';
const VERSION_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Module-level cache — works on both server (per-process) and client (per-session)
let _versionCache: { version: string; fetchedAt: number } | null = null;

/** Synchronous accessor — returns cached version or fallback. */
export function getDDragonVersion(): string {
	return _versionCache?.version ?? FALLBACK_VERSION;
}

/**
 * Async accessor — fetches the latest DDragon version from Riot and caches it.
 * Falls back to cached/env value on network error.
 */
export async function getDDragonVersionAsync(): Promise<string> {
	const now = Date.now();
	if (_versionCache && now - _versionCache.fetchedAt < VERSION_CACHE_TTL) {
		return _versionCache.version;
	}
	try {
		const res = await fetch(`${DDRAGON_BASE}/api/versions.json`);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const versions: string[] = await res.json();
		const version = versions[0] || FALLBACK_VERSION;
		_versionCache = { version, fetchedAt: now };
		return version;
	} catch {
		// Keep stale cache if available, otherwise use fallback
		return _versionCache?.version ?? FALLBACK_VERSION;
	}
}

export function getChampionIconUrl(championImage: string): string {
	return `${DDRAGON_BASE}/cdn/${getDDragonVersion()}/img/champion/${championImage}`;
}

export function getChampionSplashUrl(championId: string): string {
	return `${DDRAGON_BASE}/cdn/img/champion/splash/${championId}_0.jpg`;
}

export function getChampionLoadingUrl(championId: string): string {
	return `${DDRAGON_BASE}/cdn/img/champion/loading/${championId}_0.jpg`;
}

/** Fetch all champions from Data Dragon (server-side, with 24h Next.js cache). */
export async function fetchAllChampions(locale: string = 'en_US'): Promise<Champion[]> {
	const version = await getDDragonVersionAsync();
	const ddLocale = locale === 'ja' ? 'ja_JP' : 'en_US';
	const url = `${DDRAGON_BASE}/cdn/${version}/data/${ddLocale}/champion.json`;

	const res = await fetch(url, { next: { revalidate: 86400 } }); // Cache 24h
	if (!res.ok) throw new Error(`Failed to fetch champions: ${res.statusText}`);

	const data = await res.json();
	const champions: Champion[] = Object.values(data.data).map((c: any) => ({
		id: c.id,
		key: c.key,
		name: c.name,
		image: c.image.full,
		tags: c.tags,
	}));

	return champions.sort((a, b) => a.name.localeCompare(b.name));
}
