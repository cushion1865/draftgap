'use client';

import { useState, useRef, useEffect } from 'react';
import { useT } from '@/lib/useT';
import { RankTier, RANK_TIERS } from '@/lib/types';

const RANK_COLORS: Record<string, string> = {
	iron: '#6b7280',
	bronze: '#b45309',
	silver: '#9ca3af',
	gold: '#c8aa6e',
	platinum: '#0891b2',
	emerald: '#059669',
	diamond: '#3b82f6',
	master: '#7c3aed',
	grandmaster: '#dc2626',
	challenger: '#f59e0b',
};

function getRankColor(value: string): string {
	if (value === 'all') return '#6b7280';
	const base = value.replace('+', '');
	return RANK_COLORS[base] ?? '#6b7280';
}

interface RankSelectorProps {
	value: RankTier;
	onChange: (value: RankTier) => void;
}

export default function RankSelector({ value, onChange }: RankSelectorProps) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const t = useT();

	useEffect(() => {
		function handleOutsideClick(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === 'Escape') setOpen(false);
		}
		document.addEventListener('mousedown', handleOutsideClick);
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('mousedown', handleOutsideClick);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, []);

	const selected = RANK_TIERS.find(r => r.value === value);

	return (
		<div className="rank-selector-custom" ref={ref}>
			<span className="rank-label">{t('rank.label')}</span>
			<button
				className={`rank-selector-btn${open ? ' open' : ''}`}
				onClick={() => setOpen(prev => !prev)}
				aria-expanded={open}
				aria-haspopup="listbox"
			>
				<span className="rank-dot" style={{ background: getRankColor(value) }} />
				<span>{value === 'all' ? t('rank.all') : selected?.label ?? t('rank.all')}</span>
				<span className="rank-selector-arrow">{open ? '▲' : '▼'}</span>
			</button>

			{open && (
				<div className="rank-dropdown" role="listbox">
					{/* All */}
					<button
						className={`rank-option${value === 'all' ? ' active' : ''}`}
						onClick={() => { onChange('all'); setOpen(false); }}
						role="option"
						aria-selected={value === 'all'}
					>
						<span className="rank-dot" style={{ background: getRankColor('all') }} />
						{t('rank.all')}
					</button>

					{/* Range section */}
					<div className="rank-section-label">{t('rank.range')}</div>
					{RANK_TIERS.filter(r => r.value.endsWith('+')).map(r => (
						<button
							key={r.value}
							className={`rank-option${value === r.value ? ' active' : ''}`}
							onClick={() => { onChange(r.value); setOpen(false); }}
							role="option"
							aria-selected={value === r.value}
						>
							<span className="rank-dot" style={{ background: getRankColor(r.value) }} />
							{r.label}
						</button>
					))}

					{/* Individual section */}
					<div className="rank-section-label">{t('rank.individual')}</div>
					{RANK_TIERS.filter(r => r.value !== 'all' && !r.value.endsWith('+')).map(r => (
						<button
							key={r.value}
							className={`rank-option${value === r.value ? ' active' : ''}`}
							onClick={() => { onChange(r.value); setOpen(false); }}
							role="option"
							aria-selected={value === r.value}
						>
							<span className="rank-dot" style={{ background: getRankColor(r.value) }} />
							{r.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
