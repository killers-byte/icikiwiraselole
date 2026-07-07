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
        bin: {
          950: '#0a0a0f',
          900: '#12121a',
          800: '#1e1e2e',
          700: '#2a2a3c',
          600: '#363650',
          500: '#4a4a6a',
          400: '#6e6e9e',
          300: '#a0a0c8',
          200: '#c8c8e0',
          100: '#e8e8f5',
          50: '#f5f5ff',
          accent: '#ff2a6d',
          accent2: '#05d9e8',
          success: '#00ff9f',
          warning: '#ffee00',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #ff2a6d' },
          '100%': { boxShadow: '0 0 20px #ff2a6d, 0 0 40px #ff2a6d' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
