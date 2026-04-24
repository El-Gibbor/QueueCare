/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        civic: {
          blue: 'var(--civic-blue)',
          green: 'var(--civic-green)',
          amber: 'var(--civic-amber)',
          dark: 'var(--civic-dark)',
          muted: 'var(--civic-muted)',
          border: 'var(--civic-border)',
          surface: 'var(--civic-surface)',
          bg: 'var(--civic-bg)',
        },
      },
      fontFamily: {
        sans: ['Lexend', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        civic: '0 1px 12px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};
