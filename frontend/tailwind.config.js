/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f7f2e8",
          100: "#efe2cf",
          400: "#c76b4f",
          500: "#b45c43",
          600: "#9a4f3a",
          900: "#14532d",
          950: "#0f3a22",
        },
        cream: {
          50: "#faf7f2",
          100: "#f4ece2",
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
    },
  },
  plugins: [],
};
