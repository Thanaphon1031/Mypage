/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['"IBM Plex Sans Thai"', 'Inter', 'system-ui', 'sans-serif'] },
      colors: { ink: '#2b1d1b', mist: '#f6efe5', violet: '#7f2438', cyan: '#b7792b', burgundy: '#7f2438', gold: '#c58a3a', paper: '#fffaf2' },
      boxShadow: { glow: '0 20px 70px rgba(127,36,56,.18)', paper: '6px 6px 0 #c58a3a, 0 16px 30px rgba(67,37,29,.12)' },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        'fade-up': { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'translateY(0)' } }
      },
      animation: { float: 'float 5s ease-in-out infinite', 'fade-up': 'fade-up .6s ease-out both' }
    }
  },
  plugins: []
}
