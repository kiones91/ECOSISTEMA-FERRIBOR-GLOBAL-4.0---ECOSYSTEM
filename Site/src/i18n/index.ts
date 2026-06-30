import { pt } from './locales/pt';

export type Lang = 'pt' | 'en' | 'es' | 'fr';

export const SUPPORTED: Lang[] = ['pt', 'en', 'es', 'fr'];

// PT is the default/SSR language and ships in the initial bundle. The other
// dictionaries are loaded on demand (only when the user switches language),
// keeping ~60KB of unused locale data out of the critical hydration path.
export const dictionaries: Partial<Record<Lang, any>> = { pt };

const loaders: Record<Exclude<Lang, 'pt'>, () => Promise<any>> = {
	en: () => import('./locales/en').then((m) => m.en),
	es: () => import('./locales/es').then((m) => m.es),
	fr: () => import('./locales/fr').then((m) => m.fr),
};

export async function loadDictionary(lang: Lang): Promise<any> {
	if (dictionaries[lang]) return dictionaries[lang];
	const dict = await loaders[lang as Exclude<Lang, 'pt'>]();
	dictionaries[lang] = dict;
	return dict;
}

export const LANG_META: Record<Lang, { flag: string; label: string }> = {
	pt: { flag: 'circle-flags:br', label: 'PT' },
	en: { flag: 'circle-flags:us', label: 'EN' },
	es: { flag: 'circle-flags:es', label: 'ES' },
	fr: { flag: 'circle-flags:fr', label: 'FR' },
};

export function resolve(obj: any, path: string): any {
	return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}
