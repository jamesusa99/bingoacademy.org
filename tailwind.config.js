/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0891b2', 600: '#0e7490', 700: '#155e75' },
        bingo: { dark: '#0f172a', surface: '#f0f9ff' },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(8, 145, 178, 0.15)',
        'glow-lg': '0 0 32px rgba(8, 145, 178, 0.12)',
      },
      backgroundImage: {
        'gradient-edu': 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%)',
        'gradient-tech': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      },
    },
  },
  plugins: [],
}
