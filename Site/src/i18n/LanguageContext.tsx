"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { dictionaries, loadDictionary, resolve, SUPPORTED, type Lang } from './index';

interface I18nContextValue {
	lang: Lang;
	setLang: (l: Lang) => void;
	t: (path: string) => any;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
	// First render is always PT to match the statically exported HTML; corrected on mount.
	const [lang, setLangState] = useState<Lang>('pt');

	// Switch only after the target dictionary is loaded, so the UI never flashes
	// PT fallbacks while a lazy-loaded locale is in flight.
	const switchTo = (l: Lang) => {
		if (l === 'pt' || dictionaries[l]) {
			setLangState(l);
			return;
		}
		loadDictionary(l).then(() => setLangState(l));
	};

	useEffect(() => {
		// Only honor an explicit saved choice. We intentionally do NOT auto-detect
		// navigator.language: the site is PT-BR by default (matching the statically
		// exported HTML), and auto-switching on first visit repainted the hero <h1>
		// — the LCP element — after hydration, which pushed the simulated LCP past
		// 19s in PageSpeed. First-time visitors stay PT (no repaint); other languages
		// are opt-in via the switcher.
		const saved = localStorage.getItem('ferribor_lang') as Lang | null;
		if (saved && saved !== 'pt' && SUPPORTED.includes(saved)) {
			switchTo(saved);
		}
	}, []);

	const setLang = (l: Lang) => {
		switchTo(l);
		try {
			localStorage.setItem('ferribor_lang', l);
		} catch {}
	};

	const t = (path: string) => {
		const value = resolve(dictionaries[lang], path);
		return value !== undefined ? value : (resolve(dictionaries.pt, path) ?? path);
	};

	return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
	const ctx = useContext(I18nContext);
	if (!ctx) throw new Error('useI18n must be used within LanguageProvider');
	return ctx;
}
