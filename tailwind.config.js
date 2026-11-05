/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./middleware.ts",
  ],
  theme: {
    extend: {
      colors: {
        // Dark cinematic palette. "ink" is the light foreground, "paper" the
        // light edge/highlight colour, and surface/night are the backgrounds.
        // Keep these in sync with app/globals.css.
        ink: "#f4f1e9",
        "ink-soft": "#b9c3d0",
        "ink-muted": "#8a95a6",
        cream: "#080d16",
        paper: "#f4f1e9",
        surface: "#0d1521",
        night: "#050810",
        sand: "#101a28",
        "sand-deep": "#182337",
        line: "#202d40",
        forest: "#c9a25e",
        "forest-deep": "#a07c3c",
        "forest-soft": "#eadfc6",
        brass: "#c9a25e",
        "brass-soft": "#e6cf9e",
        "brass-pale": "#16130b",
        rust: "#e07a55",
      },
      fontFamily: {
        sans: [
          "var(--font-poppins)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        display: [
          "var(--font-poppins)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 1px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.28), 0 26px 50px -34px rgba(0, 0, 0, 0.9)",
        lift: "0 2px 4px rgba(0, 0, 0, 0.45), 0 32px 64px -38px rgba(0, 0, 0, 0.95)",
        float: "0 1px 2px rgba(0, 0, 0, 0.5), 0 40px 90px -52px rgba(0, 0, 0, 1)",
      },
      borderRadius: {
        panel: "0.85rem",
      },
      letterSpacing: {
        label: "0.16em",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          from: { transform: "translateX(-50%)" },
          to: { transform: "translateX(0)" },
        },
        "ken-burns": {
          "0%": { transform: "scale(1) translate3d(0, 0, 0)" },
          "100%": { transform: "scale(1.08) translate3d(0, -1.5%, 0)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        marquee: "marquee 38s linear infinite",
        "marquee-reverse": "marquee-reverse 44s linear infinite",
        "ken-burns": "ken-burns 22s ease-out alternate infinite",
        "fade-up": "fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};
