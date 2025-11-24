/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8F4E8',
          100: '#C8E2C8',
          200: '#95CA95',
          300: '#6BB26B',
          400: '#4E9A4E',
          500: '#2D7A2D',
          600: '#266B26',
          700: '#1F5C1F',
          800: '#184D18',
          900: '#123E12',
        },
        accent: {
          50: '#FFFEF7',
          100: '#FFFAEB',
          200: '#FEF3C7',
          300: '#FDE68A',
          400: '#FCD34D',
          500: '#FBBF24',
          600: '#F59E0B',
          700: '#D97706',
          800: '#B45309',
          900: '#92400E',
        },
      },
      fontFamily: {
        sans: ['Crimson Text', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
