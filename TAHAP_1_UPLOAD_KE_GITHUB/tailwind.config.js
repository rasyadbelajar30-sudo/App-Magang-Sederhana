/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          500: '#4F46E5',
          600: '#4338CA',
        },
        cyan: {
          500: '#06B6D4',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#F43F5E',
        ink: {
          950: '#0B0B14',
          900: '#12121F',
          800: '#1C1C2E',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        signature: ['"Dancing Script"', 'cursive'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg,#4F46E5 0%,#7C3AED 50%,#06B6D4 100%)',
      },
    },
  },
  plugins: [],
};
