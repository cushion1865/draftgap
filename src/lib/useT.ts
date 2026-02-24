'use client';

import { useContext } from 'react';
import { LocaleContext } from '@/app/ClientLayout';
import en from '@/messages/en.json';
import ja from '@/messages/ja.json';

type Messages = typeof en;
const MESSAGES: Record<string, Messages> = { en, ja };

/** Resolve a dot-separated key from a nested object. */
function resolve(obj: any, path: string): string | undefined {
	return path.split('.').reduce((acc, k) => (acc != null ? acc[k] : undefined), obj);
}

/**
 * Simple translation hook.
 * Usage:
 *   const t = useT();
 *   t('home.title')
 *   t('matchup.games', { count: 42 })        // → "42 games"
 *   t('pool.count', { count: 1 })             // → plural-aware key lookup
 */
export function useT() {
	const { locale } = useContext(LocaleContext);
	const messages = MESSAGES[locale] ?? MESSAGES.en;

	return function t(key: string, params?: Record<string, string | number>): string {
		// Plural support: try "{key}_one" / "{key}_other" when count is provided
		let resolved: string | undefined;
		if (params && 'count' in params) {
			const count = Number(params.count);
			const pluralKey = count === 1 ? `${key}_one` : `${key}_other`;
			resolved = resolve(messages, pluralKey) ?? resolve(messages, key);
		} else {
			resolved = resolve(messages, key);
		}

		let msg = typeof resolved === 'string' ? resolved : key;

		// Substitute {param} placeholders
		if (params) {
			for (const [k, v] of Object.entries(params)) {
				msg = msg.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
			}
		}

		return msg;
	};
}
