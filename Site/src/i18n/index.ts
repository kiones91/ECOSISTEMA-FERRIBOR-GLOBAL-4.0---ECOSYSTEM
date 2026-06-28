import { pt } from './locales/pt';
import { en } from './locales/en';
import { es } from './locales/es';
import { fr } from './locales/fr';

export type Lang = 'pt' | 'en' | 'es' | 'fr';

export const SUPPORTED: Lang[] = ['pt', 'en', 'es', 'fr'];

export const dictionaries: Record<Lang, any> = { pt, en, es, fr };

export const LANG_META: Record<Lang, { flag: string; label: string }> = {
	pt: { flag: 'circle-flags:br', label: 'PT' },
	en: { flag: 'circle-flags:us', label: 'EN' },
	es: { flag: 'circle-flags:es', label: 'ES' },
	fr: { flag: 'circle-flags:fr', label: 'FR' },
};

export function resolve(obj: any, path: string): any {
	return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}
