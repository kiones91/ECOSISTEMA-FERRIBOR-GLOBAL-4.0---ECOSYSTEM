import { BRANDING } from '@/config/branding';

const FALLBACK_PUBLIC_APP_URL = BRANDING.public_app_url;

const BLOCKED_HOST =
  /(^|\.)lovableproject\.com$|(^|\.)lovable\.app$|(^|\.)lovable\.dev$|^localhost$|^127\.0\.0\.1$/i;

const LEGACY_ONLINE_HOST = /^(app\.)?buffallos\.online$/i;

function normalizeConfiguredUrl(value?: string | null): string | null {
  const raw = value?.trim().replace(/\/+$/, '');
  if (!raw) return null;
  try {
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    if (BLOCKED_HOST.test(url.hostname.toLowerCase())) return null;
    if (LEGACY_ONLINE_HOST.test(url.hostname.toLowerCase())) return FALLBACK_PUBLIC_APP_URL;
    return url.origin;
  } catch {
    return null;
  }
}

function canonicalizeOrigin(origin: string): string {
  try {
    const url = new URL(origin);
    if (LEGACY_ONLINE_HOST.test(url.hostname.toLowerCase())) return FALLBACK_PUBLIC_APP_URL;
    if (BLOCKED_HOST.test(url.hostname.toLowerCase())) return FALLBACK_PUBLIC_APP_URL;
    return url.origin;
  } catch {
    return FALLBACK_PUBLIC_APP_URL;
  }
}

function resolveExplicitPublicUrl(): string | null {
  return (
    normalizeConfiguredUrl(import.meta.env.VITE_PUBLIC_APP_URL) ||
    normalizeConfiguredUrl(BRANDING.public_app_url)
  );
}

export function isEditorHost(hostname = typeof window !== 'undefined' ? window.location.hostname : ''): boolean {
  return (
    hostname.endsWith('.lovableproject.com') ||
    hostname.includes('-preview--') ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1'
  );
}

export function getPublicAppUrl(configuredUrl?: string | null): string {
  const explicit =
    normalizeConfiguredUrl(configuredUrl) || resolveExplicitPublicUrl();

  if (explicit) return explicit;

  if (typeof window === 'undefined') {
    return FALLBACK_PUBLIC_APP_URL;
  }

  if (!isEditorHost(window.location.hostname)) {
    return canonicalizeOrigin(window.location.origin);
  }

  return FALLBACK_PUBLIC_APP_URL;
}

export function usePublicAppUrl() {
  return { data: getPublicAppUrl() };
}
