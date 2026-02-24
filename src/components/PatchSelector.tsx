'use client';

import { useState, useRef, useEffect } from 'react';
import { useT } from '@/lib/useT';

export interface PatchInfo {
	patch: string;
	games: number;
}

interface PatchSelectorProps {
	value: string;          // '' = all patches
	patches: PatchInfo[];
	onChange: (patch: string) => void;
}

export default function PatchSelector({ value, patches, onChange }: PatchSelectorProps) {
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

	const label = value ? value : t('patch.all');

	return (
		<div className="patch-selector" ref={ref}>
			<span className="patch-label">{t('patch.label')}</span>
			<button
				className={`patch-selector-btn${open ? ' open' : ''}`}
				onClick={() => setOpen(prev => !prev)}
				aria-expanded={open}
				aria-haspopup="listbox"
			>
				<span>{label}</span>
				<span className="patch-selector-arrow">{open ? '▲' : '▼'}</span>
			</button>

			{open && (
				<div className="patch-dropdown" role="listbox">
					<button
						className={`patch-option${value === '' ? ' active' : ''}`}
						onClick={() => { onChange(''); setOpen(false); }}
						role="option"
						aria-selected={value === ''}
					>
						{t('patch.all')}
					</button>
					{patches.map(p => (
						<button
							key={p.patch}
							className={`patch-option${value === p.patch ? ' active' : ''}`}
							onClick={() => { onChange(p.patch); setOpen(false); }}
							role="option"
							aria-selected={value === p.patch}
						>
							{p.patch}
							<span className="patch-games">{p.games.toLocaleString()} games</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
