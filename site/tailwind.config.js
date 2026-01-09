/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        card: '#18181b',
        border: '#27272a',
        'green-primary': '#4ade80',
        'green-secondary': '#22c55e',
        'pink-pill': '#ec4899',
        'yellow-gold': '#fbbf24',
      },
      fontFamily: {
        retro: ['"Press Start 2P"', 'monospace'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
    },
  },
  plugins: [],
};
