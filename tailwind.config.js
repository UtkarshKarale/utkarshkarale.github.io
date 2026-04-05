/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          900: '#0b1021',
          800: '#10162d',
        },
        accent: {
          500: '#f5c542',
          400: '#ffd369',
        },
      },
      boxShadow: {
        glow: '0 10px 40px -18px rgba(245, 197, 66, 0.55)',
      },
    },
  },
  plugins: [],
}
