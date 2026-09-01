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
        gold: {
          50: "#FAF7ED",
          100: "#F2EBCF",
          200: "#E5D49D",
          300: "#D7BD6A",
          400: "#CBA741",
          500: "#B89228",
          600: "#96721C",
          700: "#735417",
          800: "#573F17",
          900: "#443217",
          DEFAULT: "#CBA741",
          glow: "#F3E3A0"
        },
        obsidian: {
          950: "#08080A",
          900: "#0F1015",
          800: "#171922",
          700: "#222533"
        }
      },
      fontFamily: {
        serif: ["Cinzel", "Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      backgroundImage: {
        'luxury-gradient': 'radial-gradient(ellipse at top, rgba(203,167,65,0.15), rgba(8,8,10,0.95))',
        'gold-shimmer': 'linear-gradient(135deg, #CBA741 0%, #F3E3A0 50%, #96721C 100%)',
        'glass-card': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)'
      }
    },
  },
  plugins: [],
};
export default config;
