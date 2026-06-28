import { useState, useRef, useEffect } from 'react';
import { useI18n } from './LanguageContext';
import { SUPPORTED, LANG_META, type Lang } from './index';

export function LanguageSwitcher({ dark = true }: { dark?: boolean }) {
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
				aria-label="Select language"
				aria-haspopup="listbox"
				aria-expanded={open}
				className={`flex items-center gap-1.5 sm:gap-2 rounded-full border px-2.5 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.12em] shadow-sm transition-all duration-300 ${
					dark 
						? "border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/45" 
						: "border-neutral-200 bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
				}`}
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
					className={`absolute right-0 mt-2 w-36 rounded-2xl p-1.5 shadow-lg border z-30 ${
						dark 
							? "bg-neutral-900 border-white/10 text-white" 
							: "bg-white border-neutral-200 text-slate-700"
					}`}
				>
					{SUPPORTED.map((l) => (
						<li key={l}>
							<button
								type="button"
								role="option"
								aria-selected={l === lang}
								onClick={() => choose(l)}
								className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
									l === lang 
										? 'bg-red-600/10 text-red-500' 
										: dark
											? 'text-neutral-300 hover:bg-white/5 hover:text-red-500'
											: 'text-slate-700 hover:bg-slate-900/[0.04] hover:text-red-500'
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
