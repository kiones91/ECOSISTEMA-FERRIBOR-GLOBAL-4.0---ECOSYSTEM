import type { Config } from 'tailwindcss';
import designTokens from './styles/design-tokens.json';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    colors: {
      primary: {
        100: designTokens.colors.primary100,
        80: designTokens.colors.primary80,
        60: designTokens.colors.primary60,
      },
      secondary: {
        100: designTokens.colors.secondary100,
      },
      neutral: {
        100: designTokens.colors.neutral100,
        80: designTokens.colors.neutral80,
        30: designTokens.colors.neutral30,
      },
      success: designTokens.colors.success,
      error: designTokens.colors.error,
    },
    fontFamily: {
      sans: ['Inter Variable', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      h1: ['2.5rem', { lineHeight: '1.2' }],
      h2: ['2rem',   { lineHeight: '1.3' }],
      h3: ['1.75rem',{ lineHeight: '1.35' }],
      base: ['1rem', { lineHeight: '1.5' }],
      sm: ['0.875rem', { lineHeight: '1.4' }],
    },
    extend: {
      spacing: {
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.5rem',
        6: '2rem',
      },
    },
  },
  plugins: [],
} satisfies Config;