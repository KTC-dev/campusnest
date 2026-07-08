/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4ede4",
          100: "#eadfce",
          400: "#c76b4f",
          500: "#b85a3f",
          600: "#9f4f37",
          900: "#14532d",
          950: "#0f3a22",
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
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Sora", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 20px 45px -25px rgba(20, 83, 45, 0.28)",
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
