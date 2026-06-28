"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { dictionaries, resolve, SUPPORTED, type Lang } from './index';

interface I18nContextValue {
	lang: Lang;
	setLang: (l: Lang) => void;
	t: (path: string) => any;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function detectLang(): Lang {
	if (typeof navigator === 'undefined') return 'pt';
	const code = (navigator.language || '').slice(0, 2).toLowerCase();
	if (code === 'en' || code === 'es' || code === 'fr') return code;
	return 'pt';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
	// First render is always PT to match the statically exported HTML; corrected on mount.
	const [lang, setLangState] = useState<Lang>('pt');

	useEffect(() => {
		const saved = localStorage.getItem('ferribor_lang') as Lang | null;
		if (saved && SUPPORTED.includes(saved)) {
			setLangState(saved);
		} else {
			setLangState(detectLang());
		}
	}, []);

	const setLang = (l: Lang) => {
		setLangState(l);
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
