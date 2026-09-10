/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        burgundy: {
          DEFAULT: '#4A0F1B',
          dark: '#2E0810',
          light: '#6B1A2E',
          50: '#FBF2F4',
          100: '#F6E5E9',
          200: '#E8C2CB',
          300: '#D49AA9',
          400: '#B86E82',
          500: '#8F3D54',
          600: '#6B1A2E',
          700: '#4A0F1B',
          800: '#2E0810',
          900: '#1A0408',
        },
        cream: {
          DEFAULT: '#F7F3EF',
          dark: '#EDE5DC',
          light: '#FCFAF8',
        },
        silver: {
          DEFAULT: '#C4C4C4',
          light: '#E8E8E8',
          dark: '#9A9A9A',
        },
      },
      fontFamily: {
        display: ['Bodoni Moda', 'Georgia', 'serif'],
        bodoni: ['Bodoni Moda', 'Georgia', 'serif'],
        serif: ['Bodoni Moda', 'Georgia', 'serif'],
      },
      letterSpacing: {
        luxe: '0.25em',
        'wider-luxe': '0.3em',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'slide-down': 'slideDown 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.5s ease-out forwards',
        marquee: 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
};
