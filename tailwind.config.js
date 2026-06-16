/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#06145F',
        green: '#1B7F5E',
        gold: '#F5C04A',
        light: '#F4F5FA',
        dark: '#030A2E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-lg': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.015em', fontWeight: '700' }],
        'display-md': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
      },
      letterSpacing: {
        widest: '0.25em',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(6,20,95,0.06), 0 4px 16px 0 rgba(6,20,95,0.04)',
        'card-hover': '0 4px 24px 0 rgba(6,20,95,0.12), 0 1px 4px 0 rgba(6,20,95,0.08)',
        'nav': '0 2px 24px 0 rgba(3,10,46,0.18)',
      },
    },
  },
  plugins: [],
}
