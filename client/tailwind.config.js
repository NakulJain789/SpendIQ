/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#04060A',
          900: '#080C14',
          850: '#0D131F',
          800: '#121A2B',
          750: '#172238',
          700: '#1F2E4A',
          600: '#2C3E61',
        },
        brand: {
          violet: '#8B5CF6',
          indigo: '#6366F1',
          cyan: '#06B6D4',
          teal: '#14B8A6',
        },
        finance: {
          income: '#10B981',
          incomeDark: '#059669',
          expense: '#F43F5E',
          expenseDark: '#E11D48',
          warning: '#F59E0B',
          warningLight: '#FBBF24',
          neutral: '#94A3B8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        numeric: ['"Space Grotesk"', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.35)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'glow-income': '0 0 20px -5px rgba(16, 185, 129, 0.35)',
        'glow-expense': '0 0 20px -5px rgba(244, 63, 94, 0.35)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'mesh-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
