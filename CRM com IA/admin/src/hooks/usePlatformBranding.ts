import { useEffect } from 'react';
import {
  generateColorScale,
  buildGradient,
  hexToHsl,
  hslToString,
  pickReadableForeground,
  type GradientStyle,
} from '@/lib/colors';
import { BRANDING } from '@/config/branding';

export interface PlatformSettings {
  platform_name: string;
  support_email: string;
  primary_color: string;
  accent_color: string;
  gradient_style: string;
  gradient_custom: any | null;
  border_radius: number;
  default_theme: string;
  font_family: string;
  font_url: string;
  base_font_size: number;
  footer_text: string;
  terms_url: string;
  privacy_url: string;
  logo_url: string;
  logo_dark_url: string;
  favicon_url: string;
  login_headline: string;
  login_subheadline: string;
  login_stats_enabled: boolean;
  login_bg_image_url: string;
  login_bg_layout: string;
  login_logo_position: string;
  hide_widget_branding: boolean;
  widget_accent_color: string;
  powered_by_text: string;
  browser_title: string;
  meta_description: string;
  og_image_url: string;
  twitter_handle: string;
  default_language: string;
  public_app_url: string;
}

const FONT_URLS: Record<string, string> = {
  Inter: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
};

function injectFont(family: string, customUrl?: string | null) {
  const url = customUrl || FONT_URLS[family];
  if (!url) return;
  const linkId = 'platform-dynamic-font';
  let link = document.getElementById(linkId) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  if (link.href !== url) link.href = url;
  document.documentElement.style.setProperty(
    '--font-sans',
    `'${family}', system-ui, -apple-system, sans-serif`
  );
  document.body.style.fontFamily = `'${family}', system-ui, -apple-system, sans-serif`;
}

export const PLATFORM_BRANDING_QUERY_KEY = ['platform-branding'] as const;

export async function fetchPlatformBranding(): Promise<PlatformSettings> {
  return BRANDING as unknown as PlatformSettings;
}

export function usePlatformBranding() {
  const settings = BRANDING as unknown as PlatformSettings;

  useEffect(() => {
    const root = document.documentElement;

    const primary = settings.primary_color;
    const scale = generateColorScale(primary);
    if (scale) {
      root.style.setProperty('--primary', scale.baseStr);
      root.style.setProperty('--primary-foreground', scale.foreground);
      root.style.setProperty('--ring', scale.baseStr);
      root.style.setProperty('--sidebar-primary', scale.baseStr);
      root.style.setProperty('--sidebar-primary-foreground', scale.foreground);
      root.style.setProperty('--sidebar-ring', scale.baseStr);

      const gradStyle = (settings.gradient_style as GradientStyle) || 'vendus';
      const gradient = buildGradient(scale, gradStyle, settings.gradient_custom || null);
      root.style.setProperty('--gradient-primary', gradient);
      root.style.setProperty(
        '--gradient-accent',
        `linear-gradient(135deg, hsl(${scale.baseStr} / 0.18), hsl(${scale.lighterStr} / 0.06))`
      );
      root.style.setProperty(
        '--gradient-hero',
        `linear-gradient(135deg, hsl(${scale.lighterStr} / 0.12), hsl(${scale.baseStr} / 0.04))`
      );
      root.style.setProperty('--shadow-glow', `0 0 20px hsl(${scale.baseStr} / 0.30)`);
    }

    if (settings.accent_color) {
      const accentHsl = hexToHsl(settings.accent_color);
      if (accentHsl) {
        const accentStr = hslToString(accentHsl);
        root.style.setProperty('--accent', accentStr);
        root.style.setProperty('--accent-foreground', pickReadableForeground(accentHsl));
      }
    }

    root.style.setProperty('--radius', `${settings.border_radius}px`);

    injectFont(settings.font_family, settings.font_url || null);
    root.style.fontSize = `${settings.base_font_size}px`;

    // Favicon
    if (settings.favicon_url) {
      let faviconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = settings.favicon_url;

      let appleIcon = document.querySelector(
        "link[rel='apple-touch-icon']:not([sizes])"
      ) as HTMLLinkElement;
      if (!appleIcon) {
        appleIcon = document.createElement('link');
        appleIcon.rel = 'apple-touch-icon';
        document.head.appendChild(appleIcon);
      }
      appleIcon.href = settings.favicon_url;

      let manifestLink = document.querySelector("link[rel='manifest']") as HTMLLinkElement;
      if (manifestLink) {
        const dynamicManifest = {
          name: settings.platform_name,
          short_name: settings.platform_name,
          description: settings.meta_description,
          start_url: '/',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#0a0d14',
          theme_color: settings.primary_color,
          icons: [192, 384, 512].map((s) => ({
            src: settings.favicon_url,
            sizes: `${s}x${s}`,
            type: 'image/png',
            purpose: 'maskable any',
          })),
          lang: settings.default_language,
        };

        const manifestBlob = new Blob([JSON.stringify(dynamicManifest)], {
          type: 'application/json',
        });
        const manifestUrl = URL.createObjectURL(manifestBlob);
        manifestLink.href = manifestUrl;
      }
    }

    document.title = settings.browser_title || settings.platform_name;

    let themeColor = document.querySelector("meta[name='theme-color']") as HTMLMetaElement;
    if (!themeColor) {
      themeColor = document.createElement('meta');
      themeColor.name = 'theme-color';
      document.head.appendChild(themeColor);
    }
    themeColor.content = settings.primary_color;

    const updateMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        const match = selector.match(/\[(name|property)='([^']+)'\]/);
        if (match) el.setAttribute(match[1], match[2]);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    updateMeta("meta[name='description']", 'content', settings.meta_description);
    updateMeta("meta[name='author']", 'content', settings.platform_name);
    updateMeta("meta[property='og:title']", 'content', settings.platform_name);
    updateMeta("meta[property='og:description']", 'content', settings.meta_description);
    updateMeta("meta[name='twitter:card']", 'content', 'summary_large_image');

    const ogImage = settings.og_image_url || settings.logo_url;
    if (ogImage) {
      updateMeta("meta[property='og:image']", 'content', ogImage);
      updateMeta("meta[name='twitter:image']", 'content', ogImage);
    }
  }, []);

  return settings;
}

export function readCachedBrandingSync(): PlatformSettings {
  return BRANDING as unknown as PlatformSettings;
}
