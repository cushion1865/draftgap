'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useT } from '@/lib/useT';
import { useLocale } from '@/app/ClientLayout';
import { useAuth } from '@/app/ClientLayout';

export default function Header() {
	const pathname = usePathname();
	const router = useRouter();
	const t = useT();
	const { locale, setLocale } = useLocale();
	const { user, username, signOut } = useAuth();

	async function handleSignOut() {
		await signOut();
		router.push('/');
		router.refresh();
	}

	return (
		<header className="header">
			<div className="header-inner">
				<Link href="/" className="header-logo">
					<span className="header-logo-icon">⚔️</span>
					<span className="header-logo-text">RiftEdge</span>
				</Link>
				<div className="header-actions">
					<Link
						href="/"
						className={`header-nav-link ${pathname === '/' ? 'active' : ''}`}
					>
						{t('header.counterPick')}
					</Link>
					<Link
						href="/pool"
						className={`header-nav-link ${pathname === '/pool' ? 'active' : ''}`}
					>
						{t('header.myPool')}
					</Link>
					<div className="lang-switcher">
						<button
							className={`lang-btn ${locale === 'en' ? 'active' : ''}`}
							onClick={() => setLocale('en')}
						>
							EN
						</button>
						<button
							className={`lang-btn ${locale === 'ja' ? 'active' : ''}`}
							onClick={() => setLocale('ja')}
						>
							日本語
						</button>
					</div>
					{user ? (
						<div className="header-user">
							<span className="header-username">{username ?? user.email}</span>
							<button className="header-signout-btn" onClick={handleSignOut}>
								{t('auth.signOut')}
							</button>
						</div>
					) : (
						<Link href="/auth/login" className="header-login-btn">
							{t('auth.loginBtn')}
						</Link>
					)}
				</div>
			</div>
		</header>
	);
}
