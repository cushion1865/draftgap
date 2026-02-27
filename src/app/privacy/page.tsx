'use client';

import Header from '@/components/Header';
import { useLocale } from '@/app/ClientLayout';
import Link from 'next/link';

const LAST_UPDATED = '2026-02-28';

function PrivacyEN() {
	return (
		<div className="privacy-content">
			<h1>Privacy Policy</h1>
			<p className="privacy-updated">Last updated: {LAST_UPDATED}</p>

			<h2>Overview</h2>
			<p>
				RiftEdge ("the Service") is a free League of Legends matchup statistics tool.
				This policy explains what data we collect, how we use it, and your rights.
			</p>

			<h2>Data We Collect</h2>
			<h3>If you use the Tips feature (registered users)</h3>
			<ul>
				<li><strong>Email address and username</strong> — used solely for authentication and to display your username on Tips you post.</li>
				<li><strong>Tips content</strong> — the matchup tips you choose to post publicly.</li>
			</ul>
			<h3>Stored locally on your device only</h3>
			<ul>
				<li>Language preference</li>
				<li>Champion pool selections</li>
				<li>Matchup notes (memos)</li>
			</ul>
			<p>This data is stored in your browser&apos;s localStorage and never sent to our servers.</p>

			<h2>Data We Do Not Collect</h2>
			<ul>
				<li>We do not track individual Riot/LoL account information.</li>
				<li>We do not use advertising trackers or analytics services.</li>
				<li>We do not sell your data to any third party.</li>
			</ul>

			<h2>Third-Party Services</h2>
			<ul>
				<li><strong>Riot Games API</strong> — used to collect aggregated, anonymized match statistics. Individual summoner names are never stored or displayed.</li>
				<li><strong>Supabase</strong> — handles user authentication and Tips storage. See <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase Privacy Policy</a>.</li>
				<li><strong>Vercel</strong> — hosts the application. See <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel Privacy Policy</a>.</li>
			</ul>

			<h2>Data Deletion</h2>
			<p>
				To delete your account and all associated data, please open an issue on our{' '}
				<a href="https://github.com/cushion1865/draftgap/issues" target="_blank" rel="noopener noreferrer">
					GitHub repository
				</a>.
			</p>

			<h2>Riot Games Notice</h2>
			<p>
				RiftEdge isn&apos;t endorsed by Riot Games and doesn&apos;t reflect the views or opinions
				of Riot Games or anyone officially involved in producing or managing Riot Games properties.
				League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc.
			</p>
		</div>
	);
}

function PrivacyJA() {
	return (
		<div className="privacy-content">
			<h1>プライバシーポリシー</h1>
			<p className="privacy-updated">最終更新: {LAST_UPDATED}</p>

			<h2>概要</h2>
			<p>
				RiftEdge（以下「本サービス」）は、League of Legends のマッチアップ統計を提供する無料ツールです。
				本ポリシーでは、収集するデータ、その利用方法、およびお客様の権利について説明します。
			</p>

			<h2>収集するデータ</h2>
			<h3>Tips 機能をご利用の場合（登録ユーザー）</h3>
			<ul>
				<li><strong>メールアドレスおよびユーザー名</strong> — 認証と、投稿した Tips へのユーザー名表示のみに使用します。</li>
				<li><strong>Tips の内容</strong> — 公開投稿を選択したマッチアップ Tips。</li>
			</ul>
			<h3>お使いのデバイスにのみ保存されるデータ</h3>
			<ul>
				<li>言語設定</li>
				<li>チャンピオンプールの選択</li>
				<li>マッチアップメモ</li>
			</ul>
			<p>これらのデータはブラウザの localStorage に保存され、サーバーには送信されません。</p>

			<h2>収集しないデータ</h2>
			<ul>
				<li>個別の Riot / LoL アカウント情報は追跡しません。</li>
				<li>広告トラッカーや解析サービスは使用しません。</li>
				<li>第三者へのデータ販売は行いません。</li>
			</ul>

			<h2>第三者サービス</h2>
			<ul>
				<li><strong>Riot Games API</strong> — 匿名化・集計されたマッチ統計の収集に使用します。個別のサモナー名は保存・表示されません。</li>
				<li><strong>Supabase</strong> — ユーザー認証と Tips の保存に使用します。<a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase プライバシーポリシー</a>をご参照ください。</li>
				<li><strong>Vercel</strong> — アプリのホスティングに使用します。<a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel プライバシーポリシー</a>をご参照ください。</li>
			</ul>

			<h2>データの削除</h2>
			<p>
				アカウントおよび関連データの削除をご希望の場合は、{' '}
				<a href="https://github.com/cushion1865/draftgap/issues" target="_blank" rel="noopener noreferrer">
					GitHub リポジトリ
				</a>
				にてお問い合わせください。
			</p>

			<h2>Riot Games に関する注記</h2>
			<p>
				RiftEdge は Riot Games の公式承認を受けておらず、Riot Games またはそのプロパティの制作・管理に公式に携わるいかなる個人の見解も反映するものではありません。
				League of Legends および Riot Games は Riot Games, Inc. の商標または登録商標です。
			</p>
		</div>
	);
}

export default function PrivacyPage() {
	const { locale } = useLocale();

	return (
		<>
			<Header />
			<main className="privacy-page">
				{locale === 'ja' ? <PrivacyJA /> : <PrivacyEN />}
				<div className="privacy-back">
					<Link href="/">← {locale === 'ja' ? 'トップへ戻る' : 'Back to Home'}</Link>
				</div>
			</main>
		</>
	);
}
