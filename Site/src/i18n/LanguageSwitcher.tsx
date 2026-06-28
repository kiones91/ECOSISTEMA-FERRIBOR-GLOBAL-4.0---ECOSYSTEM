"use client";

import { useState, useRef, useEffect } from 'react';
import { useI18n } from './LanguageContext';
import { SUPPORTED, LANG_META, type Lang } from './index';

export function LanguageSwitcher() {
	const { lang, setLang } = useI18n();
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const onClick = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener('mousedown', onClick);
		return () => document.removeEventListener('mousedown', onClick);
	}, []);

	const choose = (l: Lang) => {
		setLang(l);
		setOpen(false);
	};

	return (
		<div ref={ref} className="relative z-20">
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				aria-label="Selecionar idioma"
				aria-haspopup="listbox"
				aria-expanded={open}
				className="flex items-center gap-2 rounded-full border border-white/40 bg-white/10 backdrop-blur-md px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-[0_2px_12px_rgba(0,0,0,0.15)] hover:bg-white/20 hover:border-white/60 transition-all duration-300"
			>
				<i className="iconify text-base" data-icon={LANG_META[lang].flag} style={{ borderRadius: '50%', overflow: 'hidden' }}></i>
				<span>{LANG_META[lang].label}</span>
				<svg className={`w-3 h-3 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
				</svg>
			</button>

			{open && (
				<ul
					role="listbox"
					className="absolute right-0 mt-2 w-36 rounded-2xl border border-slate-900/10 bg-white/95 backdrop-blur-xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
				>
					{SUPPORTED.map((l) => (
						<li key={l}>
							<button
								type="button"
								role="option"
								aria-selected={l === lang}
								onClick={() => choose(l)}
								className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
									l === lang ? 'bg-red-600/10 text-red-600' : 'text-slate-700 hover:bg-slate-900/[0.04] hover:text-red-600'
								}`}
							>
								<i className="iconify text-lg" data-icon={LANG_META[l].flag} style={{ borderRadius: '50%', overflow: 'hidden' }}></i>
								<span>{LANG_META[l].label}</span>
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
