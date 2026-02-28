'use client';

import Header from '@/components/Header';
import { useLocale } from '@/app/ClientLayout';
import Link from 'next/link';

const LAST_UPDATED = '2026-02-28';

function TermsEN() {
	return (
		<div className="privacy-content">
			<h1>Terms of Service</h1>
			<p className="privacy-updated">Last updated: {LAST_UPDATED}</p>

			<h2>1. Acceptance of Terms</h2>
			<p>
				By accessing or using RiftEdge (&quot;the Service&quot;), you agree to be bound by these
				Terms of Service. If you do not agree to these terms, please do not use the Service.
			</p>

			<h2>2. Description of Service</h2>
			<p>
				RiftEdge is a free League of Legends matchup statistics tool that provides win rate data
				and a community Tips feature. The Service is provided &quot;as is&quot; at no cost.
			</p>

			<h2>3. User Accounts</h2>
			<p>
				You may register an account using an email address or a supported third-party provider
				(Google, Riot Games). You are responsible for maintaining the confidentiality of your
				account credentials and for all activities that occur under your account.
			</p>
			<ul>
				<li>You must provide accurate information when registering.</li>
				<li>You must be at least 13 years of age to use the Service.</li>
				<li>One person may not maintain more than one active account.</li>
			</ul>

			<h2>4. Community Tips</h2>
			<p>
				Registered users may post matchup tips (&quot;Tips&quot;) that are displayed publicly.
				By posting Tips, you grant RiftEdge a non-exclusive, royalty-free license to display
				that content on the Service.
			</p>
			<p>You agree not to post content that:</p>
			<ul>
				<li>Is abusive, harassing, hateful, or discriminatory.</li>
				<li>Contains spam, advertising, or misleading information.</li>
				<li>Violates any applicable law or third-party rights.</li>
				<li>Includes personal information of other users without consent.</li>
			</ul>
			<p>
				We reserve the right to remove any Tips that violate these terms without prior notice.
			</p>

			<h2>5. Acceptable Use</h2>
			<p>You agree not to:</p>
			<ul>
				<li>Attempt to circumvent any rate limits, security measures, or access controls.</li>
				<li>Scrape, crawl, or automate access to the Service.</li>
				<li>Use the Service for any commercial purpose without prior written consent.</li>
				<li>Interfere with the proper operation of the Service.</li>
			</ul>

			<h2>6. Intellectual Property</h2>
			<p>
				The RiftEdge name, logo, and original content are the property of the Service operator.
				Match statistics data is derived from the Riot Games API and is subject to
				Riot Games&apos; terms. User-submitted Tips remain the property of the respective authors.
			</p>

			<h2>7. Riot Games Notice</h2>
			<p>
				RiftEdge isn&apos;t endorsed by Riot Games and doesn&apos;t reflect the views or opinions
				of Riot Games or anyone officially involved in producing or managing Riot Games properties.
				League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc.
				Match data is provided by the Riot Games API under the{' '}
				<a href="https://developer.riotgames.com/terms" target="_blank" rel="noopener noreferrer">
					Riot Games Developer Terms
				</a>.
			</p>

			<h2>8. Disclaimer of Warranties</h2>
			<p>
				The Service is provided &quot;as is&quot; and &quot;as available&quot; without any warranties,
				express or implied. We do not warrant that the Service will be uninterrupted, error-free,
				or that the matchup data will be accurate or complete at all times.
			</p>

			<h2>9. Limitation of Liability</h2>
			<p>
				To the fullest extent permitted by law, RiftEdge shall not be liable for any indirect,
				incidental, special, or consequential damages arising from your use of or inability to
				use the Service.
			</p>

			<h2>10. Account Termination</h2>
			<p>
				You may delete your account at any time by contacting us via our{' '}
				<a href="https://github.com/cushion1865/draftgap/issues" target="_blank" rel="noopener noreferrer">
					GitHub repository
				</a>
				. We reserve the right to suspend or terminate accounts that violate these Terms.
			</p>

			<h2>11. Changes to These Terms</h2>
			<p>
				We may update these Terms from time to time. Continued use of the Service after changes
				are posted constitutes acceptance of the revised Terms. The &quot;Last updated&quot; date
				above will reflect any changes.
			</p>

			<h2>12. Contact</h2>
			<p>
				Questions about these Terms can be directed to our{' '}
				<a href="https://github.com/cushion1865/draftgap/issues" target="_blank" rel="noopener noreferrer">
					GitHub repository
				</a>.
			</p>
		</div>
	);
}

function TermsJA() {
	return (
		<div className="privacy-content">
			<h1>利用規約</h1>
			<p className="privacy-updated">最終更新: {LAST_UPDATED}</p>

			<h2>1. 規約への同意</h2>
			<p>
				RiftEdge（以下「本サービス」）にアクセスまたは利用することで、本利用規約に同意したものとみなします。
				同意いただけない場合は、本サービスのご利用をお控えください。
			</p>

			<h2>2. サービスの概要</h2>
			<p>
				RiftEdge は、League of Legends のマッチアップ勝率データとコミュニティ Tips 機能を提供する
				無料ツールです。本サービスは無償で「現状のまま」提供されます。
			</p>

			<h2>3. ユーザーアカウント</h2>
			<p>
				メールアドレスまたは対応するサードパーティプロバイダー（Google、Riot Games）を使用して
				アカウントを登録できます。アカウントの認証情報の管理、およびアカウントで発生するすべての
				活動についてはご本人の責任となります。
			</p>
			<ul>
				<li>登録時には正確な情報を提供してください。</li>
				<li>本サービスのご利用は13歳以上を対象としています。</li>
				<li>1人が複数のアカウントを所持することはできません。</li>
			</ul>

			<h2>4. コミュニティ Tips</h2>
			<p>
				登録ユーザーはマッチアップ Tips（以下「Tips」）を投稿でき、公開表示されます。
				Tips を投稿することで、RiftEdge に対してその内容を本サービス上に表示するための
				非独占的・無償のライセンスを付与したものとみなします。
			</p>
			<p>以下の内容を含む投稿は禁止します：</p>
			<ul>
				<li>誹謗中傷、嫌がらせ、ヘイト、差別的な内容。</li>
				<li>スパム、広告、または虚偽・誤解を招く情報。</li>
				<li>適用される法律または第三者の権利を侵害する内容。</li>
				<li>同意なく他のユーザーの個人情報を含む内容。</li>
			</ul>
			<p>
				上記に違反する Tips は、事前通知なく削除する権利を留保します。
			</p>

			<h2>5. 禁止事項</h2>
			<p>以下の行為を禁止します：</p>
			<ul>
				<li>レート制限、セキュリティ対策、またはアクセス制御の回避。</li>
				<li>本サービスへの自動アクセス（スクレイピング・クローリング等）。</li>
				<li>事前の書面による同意なく本サービスを商業目的で使用すること。</li>
				<li>本サービスの正常な運営を妨害する行為。</li>
			</ul>

			<h2>6. 知的財産</h2>
			<p>
				RiftEdge の名称、ロゴ、および独自コンテンツはサービス運営者の財産です。
				マッチ統計データは Riot Games API から取得されており、Riot Games の規約に従います。
				ユーザーが投稿した Tips の著作権は各投稿者に帰属します。
			</p>

			<h2>7. Riot Games に関する注記</h2>
			<p>
				RiftEdge は Riot Games の公式承認を受けておらず、Riot Games またはそのプロパティの
				制作・管理に公式に携わるいかなる個人の見解も反映するものではありません。
				League of Legends および Riot Games は Riot Games, Inc. の商標または登録商標です。
				マッチデータは{' '}
				<a href="https://developer.riotgames.com/terms" target="_blank" rel="noopener noreferrer">
					Riot Games 開発者規約
				</a>
				のもと Riot Games API より提供されています。
			</p>

			<h2>8. 免責事項</h2>
			<p>
				本サービスは「現状のまま」「利用可能な範囲で」提供され、明示・黙示を問わず
				いかなる保証も行いません。サービスの継続性、エラーの不存在、マッチアップデータの
				正確性・完全性について保証するものではありません。
			</p>

			<h2>9. 責任の制限</h2>
			<p>
				適用法令の許容する最大限の範囲において、RiftEdge は本サービスの利用または
				利用不能から生じるいかなる間接的・付随的・特別・結果的損害についても責任を負いません。
			</p>

			<h2>10. アカウントの削除・停止</h2>
			<p>
				アカウントの削除はいつでも{' '}
				<a href="https://github.com/cushion1865/draftgap/issues" target="_blank" rel="noopener noreferrer">
					GitHub リポジトリ
				</a>
				よりお申し出ください。本規約に違反するアカウントは予告なく停止・削除することがあります。
			</p>

			<h2>11. 規約の変更</h2>
			<p>
				本規約は随時更新されることがあります。変更後も本サービスを継続して利用することで、
				改訂後の規約に同意したものとみなします。変更は上部の「最終更新」日に反映されます。
			</p>

			<h2>12. お問い合わせ</h2>
			<p>
				本規約に関するお問い合わせは{' '}
				<a href="https://github.com/cushion1865/draftgap/issues" target="_blank" rel="noopener noreferrer">
					GitHub リポジトリ
				</a>
				までご連絡ください。
			</p>
		</div>
	);
}

export default function TermsPage() {
	const { locale } = useLocale();

	return (
		<>
			<Header />
			<main className="privacy-page">
				{locale === 'ja' ? <TermsJA /> : <TermsEN />}
				<div className="privacy-back">
					<Link href="/">← {locale === 'ja' ? 'トップへ戻る' : 'Back to Home'}</Link>
				</div>
			</main>
		</>
	);
}
