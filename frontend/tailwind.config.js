/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        astro: {
          cream: '#F5EFE6',
          'cream-dark': '#EDE6DA',
          dark: '#1A1A1A',
          card: '#FFFFFF',
          border: '#E8E0D4',
          muted: '#6B6560',
          accent: '#C4A882',
          tan: '#D4C4B0',
        },
        cosmic: {
          bg: '#F5EFE6',
          card: '#FFFFFF',
          border: '#E8E0D4',
          borderHover: '#C4A882',
          purple: '#1A1A1A',
          gold: '#C4A882',
          pink: '#D4A574',
          light: '#1A1A1A',
          muted: '#6B6560',
          darker: '#EDE6DA'
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'twinkle': 'twinkle 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'nebula': 'nebula 15s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 1 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        nebula: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: 0.3 },
          '50%': { transform: 'scale(1.05) rotate(180deg)', opacity: 0.5 },
        }
      }
    },
  },
  plugins: [],
}
