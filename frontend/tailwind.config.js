/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#a855f7",
          500: "#9333ea",
          600: "#6D28D9",
          700: "#5B21B6",
          800: "#6b21a8",
          900: "#3b0764",
          950: "#1e0a3c",
        },
        primary: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#a855f7",
          500: "#9333ea",
          600: "#6D28D9",
          700: "#5B21B6",
          800: "#6b21a8",
          900: "#3b0764",
          950: "#1e0a3c",
        },
        cream: {
          50: "#faf7f2",
          100: "#f4ece2",
        },
        gold: {
          400: "#d4a017",
        },
        slate: {
          700: "#334155",
          800: "#1f2937",
        },
        text: {
          primary: "#111827",
          secondary: "#6B7280",
        },
        success: {
          DEFAULT: "#10B981",
          light: "#D1FAE5",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7",
        },
        error: {
          DEFAULT: "#EF4444",
          light: "#FEE2E2",
        },
        card: "#FFFFFF",
        border: "#E5E7EB",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Sora", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 20px 45px -25px rgba(88, 28, 135, 0.28)",
        "soft-lg": "0 20px 50px -25px rgba(88, 28, 135, 0.28)",
        premium: "0 6px 28px -10px rgba(88, 28, 135, 0.22)",
        "premium-lg": "0 16px 48px -18px rgba(88, 28, 135, 0.32)",
        brand: "0 8px 28px -12px rgba(88, 28, 135, 0.35)",
        "brand-lg": "0 16px 40px -14px rgba(88, 28, 135, 0.45)",
      },
      borderRadius: {
        card: "20px",
        "card-sm": "18px",
        "card-lg": "24px",
        hero: "28px",
        "hero-lg": "32px",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        softPulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 360ms ease-out both",
        softPulse: "softPulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};