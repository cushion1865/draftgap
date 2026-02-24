'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export type Locale = 'en' | 'ja';

const STORAGE_KEY = 'riftedge-locale';

interface LocaleCtx {
	locale: Locale;
	setLocale: (l: Locale) => void;
}

export const LocaleContext = createContext<LocaleCtx>({ locale: 'en', setLocale: () => {} });

export function useLocale(): LocaleCtx {
	return useContext(LocaleContext);
}

interface AuthCtx {
	user: User | null;
	username: string | null;
	signOut: () => Promise<void>;
	refreshUsername: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
	user: null,
	username: null,
	signOut: async () => {},
	refreshUsername: async () => {},
});

export function useAuth(): AuthCtx {
	return useContext(AuthContext);
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
	const [locale, setLocaleState] = useState<Locale>('en');
	const [user, setUser] = useState<User | null>(null);
	const [username, setUsername] = useState<string | null>(null);

	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
		if (stored === 'en' || stored === 'ja') setLocaleState(stored);
	}, []);

	const doFetchUsername = useCallback(async (userId: string) => {
		const supabase = createClient();
		const { data } = await supabase
			.from('profiles')
			.select('username')
			.eq('id', userId)
			.maybeSingle();
		setUsername(data?.username ?? null);
	}, []);

	useEffect(() => {
		const supabase = createClient();

		// 初回セッション取得
		supabase.auth.getUser().then(({ data }) => {
			setUser(data.user ?? null);
			if (data.user) doFetchUsername(data.user.id);
		});

		// セッション変化を監視
		const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
			if (session?.user) {
				doFetchUsername(session.user.id);
			} else {
				setUsername(null);
			}
		});

		return () => subscription.unsubscribe();
	}, [doFetchUsername]);

	// サインアップ後にプロフィール作成が完了してから呼ぶ用
	const refreshUsername = useCallback(async () => {
		const supabase = createClient();
		const { data: { user: currentUser } } = await supabase.auth.getUser();
		if (currentUser) await doFetchUsername(currentUser.id);
	}, [doFetchUsername]);

	function setLocale(l: Locale) {
		setLocaleState(l);
		localStorage.setItem(STORAGE_KEY, l);
	}

	async function signOut() {
		const supabase = createClient();
		await supabase.auth.signOut();
		setUser(null);
		setUsername(null);
	}

	return (
		<LocaleContext.Provider value={{ locale, setLocale }}>
			<AuthContext.Provider value={{ user, username, signOut, refreshUsername }}>
				{children}
			</AuthContext.Provider>
		</LocaleContext.Provider>
	);
}
