import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        casino: {
          green: '#0B5C2C',
          darkgreen: '#084525',
          gold: '#FFD700',
          red: '#DC143C',
        }
      },
      animation: {
        'card-deal': 'cardDeal 0.5s ease-out',
        'card-flip': 'cardFlip 0.6s ease-in-out',
      },
      keyframes: {
        cardDeal: {
          '0%': { transform: 'translateY(-100vh) rotate(0deg)', opacity: '0' },
          '100%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
        },
        cardFlip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
