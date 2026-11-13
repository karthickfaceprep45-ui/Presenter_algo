/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: 'var(--bg-page)',
        panel: 'var(--bg-panel)',
        card: 'var(--bg-card)',
        raised: 'var(--bg-raised)',
        'hand-btn': 'var(--bg-hand-btn)',
        'surface-hover': 'var(--surface-hover)',
        'surface-pressed': 'var(--surface-pressed)',
        border: 'var(--border-subtle)',
        'border-strong': 'var(--border-strong)',
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        'on-accent': 'var(--text-on-accent)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          fill: 'var(--color-accent-fill)',
          hover: 'var(--color-accent-hover)',
          pressed: 'var(--color-accent-pressed)',
          soft: 'var(--color-accent-soft)',
          border: 'var(--color-accent-border)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          soft: 'var(--color-success-soft)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          soft: 'var(--color-warning-soft)',
          dot: 'var(--color-warning-dot)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          soft: 'var(--color-danger-soft)',
          fill: 'var(--color-danger-fill)',
        },
      },
      boxShadow: {
        warm: 'var(--shadow-card)',
      }
    },
  },
  plugins: [],
}
