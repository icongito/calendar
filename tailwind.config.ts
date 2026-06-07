import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{html,js,ts,jsx,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#FAF9F7',
        'bg-card': '#FFFFFF',
        'bg-hover': '#F4F2EE',
        border: '#E8E4DC',
        'text-primary': '#1A1714',
        'text-secondary': '#7A7470',
        'text-muted': '#B0AAA4',
        accent: '#D4600A',
        'accent-soft': '#FDF0E8',
        success: '#2D7A4F',
        warning: '#C4900A',
        danger: '#B03A2E',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: '0 1px 4px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
} satisfies Config
