'use client';

import Link from 'next/link';
import { useT } from '@/lib/useT';

export default function Footer() {
	const t = useT();

	return (
		<footer className="footer">
			<div className="footer-inner">
				<p className="footer-riot-notice">
					RiftEdge isn&apos;t endorsed by Riot Games and doesn&apos;t reflect the views or opinions
					of Riot Games or anyone officially involved in producing or managing Riot Games properties.
					League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc.
				</p>
				<p className="footer-links">
					<Link href="/privacy">{t('footer.privacy')}</Link>
					<span className="footer-link-sep">·</span>
					<Link href="/terms">{t('footer.terms')}</Link>
				</p>
			</div>
		</footer>
	);
}
