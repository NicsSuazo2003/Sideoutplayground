/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          green: '#7CFC00',
          pink: '#FF1493',
        },
        surface: '#1A1A1A',
        bg: '#0A0A0A',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'pulse-green': 'pulse-green 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-green': {
          '0%, 100%': { boxShadow: '0 0 10px #7CFC00, 0 0 20px rgba(124,252,0,0.2)' },
          '50%': { boxShadow: '0 0 20px #7CFC00, 0 0 40px rgba(124,252,0,0.4)' },
        },
      },
    },
  },
  plugins: [],
};
