import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Sunlight-Ready paleta
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          dark: 'var(--color-primary-dark)',
        },
        accent: 'var(--color-accent)',
        success: 'var(--color-success)',
        error: 'var(--color-error)',
        // Kategorie
        food: 'var(--color-food)',
        history: 'var(--color-history)',
        event: 'var(--color-event)',
        kids: 'var(--color-kids)',
        nature: 'var(--color-nature)',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      spacing: {
        'thumb-zone': 'var(--thumb-zone-height)',
        'safe-bottom': 'var(--safe-bottom)',
      },
      animation: {
        'radar-pulse': 'radar-pulse 2s ease-in-out infinite',
        'radar-pulse-fast': 'radar-pulse 0.5s ease-in-out infinite',
        'confetti': 'confetti-fall 3s ease-in-out forwards',
      },
    },
  },
  plugins: [],
}

export default config
