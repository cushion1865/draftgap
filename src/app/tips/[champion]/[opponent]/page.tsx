'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useT } from '@/lib/useT';
import { useAuth } from '@/app/ClientLayout';
import { getChampionIconUrl } from '@/lib/data-dragon';
import Header from '@/components/Header';
import TipCard, { Tip } from '@/components/TipCard';

type SortMode = 'likes' | 'newest' | 'saved';

export default function TipsPage() {
	const params = useParams();
	const champion = params.champion as string;
	const opponent = params.opponent as string;
	const t = useT();
	const { user } = useAuth();

	const [tips, setTips] = useState<Tip[]>([]);
	const [userId, setUserId] = useState<string | null>(null);
	const [sort, setSort] = useState<SortMode>('likes');
	const [loading, setLoading] = useState(true);
	const [content, setContent] = useState('');
	const [posting, setPosting] = useState(false);
	const [postError, setPostError] = useState('');

	const fetchTips = useCallback(async (sortMode: SortMode) => {
		setLoading(true);
		try {
			const params = new URLSearchParams({
				champion,
				opponent,
				sort: sortMode === 'saved' ? 'likes' : sortMode,
				...(sortMode === 'saved' ? { saved: 'true' } : {}),
			});
			const res = await fetch(`/api/tips?${params}`);
			if (res.ok) {
				const data = await res.json();
				setTips(data.tips);
				setUserId(data.userId);
			}
		} finally {
			setLoading(false);
		}
	}, [champion, opponent]);

	useEffect(() => {
		fetchTips(sort);
	}, [fetchTips, sort]);

	async function handlePost(e: React.FormEvent) {
		e.preventDefault();
		if (!content.trim() || posting) return;
		setPosting(true);
		setPostError('');
		try {
			const res = await fetch('/api/tips', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ champion_id: champion, opponent_id: opponent, content: content.trim() }),
			});
			const data = await res.json();
			if (!res.ok) {
				setPostError(data.error ?? t('tips.postError'));
			} else {
				setContent('');
				setTips(prev => [data.tip, ...prev]);
			}
		} catch {
			setPostError(t('tips.postError'));
		} finally {
			setPosting(false);
		}
	}

	function handleDelete(id: string) {
		setTips(prev => prev.filter(t => t.id !== id));
	}

	return (
		<>
			<Header />
			<main className="container">
				{/* ヘッダー: vs 表示 */}
				<div className="tips-page-header">
					<Link href={`/matchup/${champion}`} className="tips-back-link">
						{t('matchup.back')}
					</Link>
					<div className="tips-matchup-title">
						<img
							src={getChampionIconUrl(`${champion}.png`)}
							alt={champion}
							className="tips-champ-icon"
						/>
						<span className="tips-vs-text">vs</span>
						<img
							src={getChampionIconUrl(`${opponent}.png`)}
							alt={opponent}
							className="tips-champ-icon"
						/>
					</div>
					<h1 className="tips-page-title">{t('tips.pageTitle')}</h1>
				</div>

				{/* 投稿フォーム */}
				{user ? (
					<form className="tip-post-form" onSubmit={handlePost}>
						<textarea
							className="tip-post-textarea"
							value={content}
							onChange={e => setContent(e.target.value)}
							placeholder={t('tips.placeholder')}
							minLength={10}
							maxLength={500}
							rows={3}
							required
						/>
						<div className="tip-post-footer">
							<span className="tip-char-count">{content.length}/500</span>
							{postError && <span className="tip-post-error">{postError}</span>}
							<button
								type="submit"
								className="tip-post-btn"
								disabled={posting || content.length < 10}
							>
								{posting ? '...' : t('tips.post')}
							</button>
						</div>
					</form>
				) : (
					<div className="tip-login-prompt">
						<p>{t('tips.loginPrompt')}</p>
						<Link href="/auth/login" className="tip-login-link">{t('auth.loginBtn')}</Link>
					</div>
				)}

				{/* ソートタブ */}
				<div className="tips-sort-tabs">
					{(['likes', 'newest', 'saved'] as SortMode[]).map(s => (
						<button
							key={s}
							className={`tips-sort-tab ${sort === s ? 'active' : ''} ${s === 'saved' && !user ? 'disabled' : ''}`}
							onClick={() => {
								if (s === 'saved' && !user) return;
								setSort(s);
							}}
						>
							{t(`tips.sort.${s}`)}
						</button>
					))}
				</div>

				{/* Tips一覧 */}
				{loading ? (
					<div className="tips-loading">{t('tips.loading')}</div>
				) : tips.length === 0 ? (
					<div className="tips-empty">{t('tips.empty')}</div>
				) : (
					<div className="tips-list">
						{tips.map(tip => (
							<TipCard
								key={tip.id}
								tip={tip}
								userId={userId}
								onDelete={handleDelete}
							/>
						))}
					</div>
				)}
			</main>
		</>
	);
}
