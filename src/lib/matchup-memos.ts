const STORAGE_KEY = 'riftedge-memos';

type MemoStore = Record<string, string>;

function load(): MemoStore {
	if (typeof window === 'undefined') return {};
	try {
		const s = localStorage.getItem(STORAGE_KEY);
		return s ? JSON.parse(s) : {};
	} catch {
		return {};
	}
}

function save(store: MemoStore): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function key(championId: string, opponentId: string): string {
	return `${championId}::${opponentId}`;
}

export function getAllMemos(): MemoStore {
	return load();
}

export function setMemo(championId: string, opponentId: string, text: string): void {
	const store = load();
	const k = key(championId, opponentId);
	if (text.trim() === '') {
		delete store[k];
	} else {
		store[k] = text;
	}
	save(store);
}

export function getMemoKey(championId: string, opponentId: string): string {
	return key(championId, opponentId);
}
