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

function HeartIcon({ filled }: { filled: boolean }) {
	return (
		<svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
		</svg>
	);
}

function BookmarkIcon({ filled }: { filled: boolean }) {
	return (
		<svg width="13" height="15" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
		</svg>
	);
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

	// 編集
	const [isEditing, setIsEditing] = useState(false);
	const [editContent, setEditContent] = useState(tip.content);
	const [displayContent, setDisplayContent] = useState(tip.content);
	const [saving, setSaving] = useState(false);

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

	function startEdit() {
		setEditContent(displayContent);
		setIsEditing(true);
	}

	function cancelEdit() {
		setIsEditing(false);
		setEditContent(displayContent);
	}

	async function handleEditSave() {
		if (saving || editContent.trim().length < 10) return;
		setSaving(true);
		try {
			const res = await fetch(`/api/tips/${tip.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content: editContent.trim() }),
			});
			if (res.ok) {
				const data = await res.json();
				setDisplayContent(data.content);
				setIsEditing(false);
			}
		} finally {
			setSaving(false);
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

			{isEditing ? (
				<div className="tip-edit-area">
					<textarea
						className="tip-edit-textarea"
						value={editContent}
						onChange={e => setEditContent(e.target.value)}
						minLength={10}
						maxLength={500}
						rows={4}
						autoFocus
					/>
					<div className="tip-edit-footer">
						<span className="tip-char-count-sm">{editContent.length}/500</span>
						<button className="tip-edit-cancel-btn" onClick={cancelEdit} disabled={saving}>
							{t('tips.editCancel')}
						</button>
						<button
							className="tip-edit-save-btn"
							onClick={handleEditSave}
							disabled={saving || editContent.trim().length < 10}
						>
							{saving ? '...' : t('tips.editSave')}
						</button>
					</div>
				</div>
			) : (
				<p className="tip-content">{displayContent}</p>
			)}

			<div className="tip-card-footer">
				{/* いいね */}
				<button
					className={`tip-like-btn ${isLiked ? 'active' : ''}`}
					onClick={handleLike}
					disabled={!userId || loadingLike}
					title={t('tips.like')}
				>
					<HeartIcon filled={isLiked} />
					<span className="tip-action-count">{likesCount}</span>
				</button>

				{/* 保存 */}
				<button
					className={`tip-save-btn ${isSaved ? 'active' : ''}`}
					onClick={handleSave}
					disabled={!userId || loadingSave}
					title={t('tips.save')}
				>
					<BookmarkIcon filled={isSaved} />
					<span className="tip-save-label">{t('tips.save')}</span>
					<span className="tip-action-count">{savesCount}</span>
				</button>

				{/* 自分の投稿: 編集・削除 */}
				{tip.isOwn && !isEditing && (
					<div className="tip-own-actions">
						<button
							className="tip-edit-btn"
							onClick={startEdit}
							title={t('tips.edit')}
						>
							{t('tips.edit')}
						</button>
						<button
							className="tip-delete-btn"
							onClick={handleDelete}
							disabled={deleting}
							title={t('tips.delete')}
						>
							{t('tips.delete')}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
