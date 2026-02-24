'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useT } from '@/lib/useT';
import { useLocale } from '@/app/ClientLayout';

export default function Header() {
	const pathname = usePathname();
	const t = useT();
	const { locale, setLocale } = useLocale();

	return (
		<header className="header">
			<div className="header-inner">
				<Link href="/" className="header-logo">
					<span className="header-logo-icon">⚔️</span>
					<span className="header-logo-text">DraftGap</span>
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
				</div>
			</div>
		</header>
	);
}
