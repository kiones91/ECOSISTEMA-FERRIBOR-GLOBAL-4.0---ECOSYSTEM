import { BRANDING } from '@/config/branding';

export function usePlatformName() {
  return {
    platformName: BRANDING.platform_name,
    poweredByText: BRANDING.powered_by_text,
    loginHeadline: BRANDING.login_headline,
    loginSubheadline: BRANDING.login_subheadline,
    loginStatsEnabled: BRANDING.login_stats_enabled,
    footerText: BRANDING.footer_text,
    loginBgImageUrl: BRANDING.login_bg_image_url || null,
    loginBgLayout: BRANDING.login_bg_layout,
    loginLogoPosition: BRANDING.login_logo_position,
    hideWidgetBranding: BRANDING.hide_widget_branding,
  };
}
