/** @type {import('tailwindcss').Config} */
// Brand tokens extracted from the AION Analytics dashboard
// (src/aion_trading_dashboard/frontend/tailwind.config.cjs). Keep them in step:
// this file is the single source of colour and type for the PWA.
module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // "Ink + Brass + Held Green", copied verbatim from the dashboard.
        ink: {
          DEFAULT: '#0b1020',
          dark: '#070b16',
          card: '#121a30',
          elevated: '#0e1528',
        },
        brass: {
          DEFAULT: '#c8a86a',
          light: '#e4c98a',
          dark: '#9a7a3a',
        },
        paper: {
          DEFAULT: '#e9edf6',
          muted: '#8b96ad',
        },
        success: '#7bb79a',
        warning: '#caa46b',
        error: '#dc2626',
        // The logo carries its own palette, which is not the UI palette.
        logo: {
          bg: '#040b15',
          ring: '#26619c',
          mark: '#e6eaf0',
        },
      },
      borderRadius: { DEFAULT: '0.625rem' },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Spectral', 'Georgia', 'serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SF Mono', 'monospace'],
      },
      boxShadow: {
        premium: '0 4px 6px -1px hsl(228 25% 8% / 0.05), 0 2px 4px -2px hsl(228 25% 8% / 0.04), 0 0 0 1px hsl(228 25% 8% / 0.03)',
        'premium-lg': '0 10px 25px -3px hsl(228 25% 8% / 0.08), 0 4px 10px -4px hsl(228 25% 8% / 0.04)',
      },
    },
  },
  plugins: [],
};
