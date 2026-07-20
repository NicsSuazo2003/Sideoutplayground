/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0d9488',
          light: '#5eead4',
          dark: '#0f766e',
        },
        accent: {
          DEFAULT: '#fbbf24',
          light: '#fde68a',
          dark: '#f59e0b',
        },
        surface: '#f3f4f6',
        bg: '#f9fafb',
        card: '#ffffff',
        'text-primary': '#1e293b',
        'text-secondary': '#64748b',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'pulse-primary': 'pulse-primary 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-primary': {
          '0%, 100%': { boxShadow: '0 0 10px #0d9488, 0 0 20px rgba(13,148,136,0.2)' },
          '50%': { boxShadow: '0 0 20px #0d9488, 0 0 40px rgba(13,148,136,0.4)' },
        },
      },
    },
  },
  plugins: [],
};