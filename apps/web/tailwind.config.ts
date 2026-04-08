import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts}",
    "./lib/**/*.{ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ["var(--font-syne)", "sans-serif"],
      },
      colors: {
        // Core palette
        slate: {
          950: "#060B14",
          900: "#0A1220",
          850: "#0F1A2E",
          800: "#141F35",
          700: "#1E2D47",
          600: "#2A3F5F",
          500: "#3D5A80",
          400: "#5C7FA8",
          300: "#8BAAC8",
          200: "#B8CCDF",
          100: "#DDE7F0",
          50:  "#F0F5FA",
        },
        amber: {
          600: "#D97706",
          500: "#F59E0B",
          400: "#FBB724",
          300: "#FCD34D",
          200: "#FDE68A",
          100: "#FEF3C7",
          50:  "#FFFBEB",
        },
        emerald: {
          600: "#059669",
          500: "#10B981",
          400: "#34D399",
        },
        rose: {
          600: "#E11D48",
          500: "#F43F5E",
          400: "#FB7185",
        },
      },
      backgroundImage: {
        "grid-slate":
          "linear-gradient(rgba(30,45,71,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(30,45,71,0.4) 1px, transparent 1px)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      boxShadow: {
        "glow-amber": "0 0 20px rgba(251,183,36,0.15)",
        "glow-sm": "0 0 10px rgba(251,183,36,0.08)",
        panel: "0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4)",
        card: "0 1px 0 rgba(255,255,255,0.03), 0 2px 12px rgba(0,0,0,0.3)",
      },
      borderColor: {
        DEFAULT: "rgba(42,63,95,0.6)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.4s ease forwards",
        "pulse-amber": "pulseAmber 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseAmber: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;