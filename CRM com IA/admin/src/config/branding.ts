import logoLight from '@/assets/branding/logo-light.png';
import logoDark from '@/assets/branding/logo-dark.png';
import favicon from '@/assets/branding/favicon.png';

export const COMPANY = {
  legal_name: 'Ferri Indústria de Artefatos de Borracha Ltda - ME',
  trade_name: 'FerriBor',
  founded: '2014-03-20',
  phone: '(19) 98174-8364',
  whatsapp: '5519981748364',
  email: 'comercial@ferribor.com.br',
  address: 'Rua Aurea Basso Baptista, 36 - Jardim D\'itália, Santa Gertrudes - SP, 13510-092',
  coordinates: { lat: -22.459630, lng: -47.533248 },
  google_maps_url: 'https://maps.app.goo.gl/fctwXZ6ank7TiMUi6',
  facebook: 'https://www.facebook.com/FerriborArtefatosDeBorracha',
  website: 'https://www.ferribor.com.br',
  mission: 'Garantir a qualidade elevada dos nossos produtos e serviços, com base na nossa competência e experiência aliada ao profissionalismo, superando as expectativas dos clientes e garantindo sua fidelização. Utilizar-se com respeito e conscientização dos Recursos Naturais e promovendo um ambiente seguro aos nossos Colaboradores.',
  vision: 'Ser reconhecida no ramo de atividade, pela capacidade de apresentar novas soluções munida de capacidade técnica e respeito aos nossos clientes.',
} as const;

export const BRANDING = {
  platform_name: 'FerriBor',
  support_email: 'comercial@ferribor.com.br',
  public_app_url: 'https://app.ferribor.com.br',
  footer_text: '© 2026 FerriBor. Todos os direitos reservados.',
  terms_url: '/politica-privacidade.pdf',
  privacy_url: '/politica-privacidade.pdf',

  logo_url: logoLight,
  logo_dark_url: logoDark,
  favicon_url: favicon,

  primary_color: '#dc2626',
  accent_color: '#dc2626',
  gradient_style: 'vendus' as const,
  gradient_custom: null,
  border_radius: 12,
  default_theme: 'dark' as const,

  font_family: 'Inter',
  font_url: '',
  base_font_size: 16,

  login_headline: 'FerriBor — Gestão Comercial',
  login_subheadline: 'Acesse o painel para gerenciar seus pedidos, clientes e operações.',
  login_stats_enabled: true,
  login_logo_position: 'left' as const,
  login_bg_image_url: '',
  login_bg_layout: 'split-left' as const,

  powered_by_text: '',
  hide_widget_branding: true,
  widget_accent_color: '#dc2626',

  browser_title: 'FerriBor — Gestão Comercial',
  meta_description: 'FerriBor — Sistema de gestão comercial e atendimento',
  og_image_url: '',
  twitter_handle: '',
  default_language: 'pt-BR',
} as const;
