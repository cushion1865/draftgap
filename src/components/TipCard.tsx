'use client';

import { useState } from 'react';
import { useT } from '@/lib/useT';

export interface Tip {
	id: string;
	content: string;
	likesCount: number;
	savesCount: number;
	createdAt: string;
	username: string;
	isLiked: boolean;
	isSaved: boolean;
	isOwn: boolean;
}

interface TipCardProps {
	tip: Tip;
	userId: string | null;
	onDelete: (id: string) => void;
}

export default function TipCard({ tip, userId, onDelete }: TipCardProps) {
	const t = useT();
	const [isLiked, setIsLiked] = useState(tip.isLiked);
	const [isSaved, setIsSaved] = useState(tip.isSaved);
	const [likesCount, setLikesCount] = useState(tip.likesCount);
	const [savesCount, setSavesCount] = useState(tip.savesCount);
	const [loadingLike, setLoadingLike] = useState(false);
	const [loadingSave, setLoadingSave] = useState(false);
	const [deleting, setDeleting] = useState(false);

	async function handleLike() {
		if (!userId || loadingLike) return;
		setLoadingLike(true);
		try {
			const res = await fetch(`/api/tips/${tip.id}/like`, { method: 'POST' });
			if (res.ok) {
				const data = await res.json();
				setIsLiked(data.liked);
				setLikesCount(prev => prev + (data.liked ? 1 : -1));
			}
		} finally {
			setLoadingLike(false);
		}
	}

	async function handleSave() {
		if (!userId || loadingSave) return;
		setLoadingSave(true);
		try {
			const res = await fetch(`/api/tips/${tip.id}/save`, { method: 'POST' });
			if (res.ok) {
				const data = await res.json();
				setIsSaved(data.saved);
				setSavesCount(prev => prev + (data.saved ? 1 : -1));
			}
		} finally {
			setLoadingSave(false);
		}
	}

	async function handleDelete() {
		if (!tip.isOwn || deleting) return;
		if (!confirm(t('tips.confirmDelete'))) return;
		setDeleting(true);
		try {
			const res = await fetch(`/api/tips/${tip.id}`, { method: 'DELETE' });
			if (res.ok) onDelete(tip.id);
		} finally {
			setDeleting(false);
		}
	}

	const date = new Date(tip.createdAt).toLocaleDateString(undefined, {
		year: 'numeric', month: 'short', day: 'numeric'
	});

	return (
		<div className="tip-card">
			<div className="tip-card-header">
				<span className="tip-username">{tip.username}</span>
				<span className="tip-date">{date}</span>
			</div>
			<p className="tip-content">{tip.content}</p>
			<div className="tip-card-footer">
				<button
					className={`tip-action-btn ${isLiked ? 'active' : ''}`}
					onClick={handleLike}
					disabled={!userId || loadingLike}
					title={t('tips.like')}
				>
					<span className="tip-action-icon">♥</span>
					<span className="tip-action-count">{likesCount}</span>
				</button>
				<button
					className={`tip-action-btn ${isSaved ? 'active saved' : ''}`}
					onClick={handleSave}
					disabled={!userId || loadingSave}
					title={t('tips.save')}
				>
					<span className="tip-action-icon">🔖</span>
					<span className="tip-action-count">{savesCount}</span>
				</button>
				{tip.isOwn && (
					<button
						className="tip-delete-btn"
						onClick={handleDelete}
						disabled={deleting}
						title={t('tips.delete')}
					>
						{t('tips.delete')}
					</button>
				)}
			</div>
		</div>
	);
}
