import { getRequestConfig } from 'next-intl/server';

// Provides a default locale for server-side rendering.
// The actual user locale is managed client-side via ClientLayout (localStorage).
export default getRequestConfig(async () => ({
	locale: 'en',
	messages: (await import('@/messages/en.json')).default,
}));
