'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export type Locale = 'en' | 'ja';

const STORAGE_KEY = 'draftgap-locale';

interface LocaleCtx {
	locale: Locale;
	setLocale: (l: Locale) => void;
}

export const LocaleContext = createContext<LocaleCtx>({ locale: 'en', setLocale: () => {} });

export function useLocale(): LocaleCtx {
	return useContext(LocaleContext);
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
	const [locale, setLocaleState] = useState<Locale>('en');

	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
		if (stored === 'en' || stored === 'ja') setLocaleState(stored);
	}, []);

	function setLocale(l: Locale) {
		setLocaleState(l);
		localStorage.setItem(STORAGE_KEY, l);
	}

	return (
		<LocaleContext.Provider value={{ locale, setLocale }}>
			{children}
		</LocaleContext.Provider>
	);
}
