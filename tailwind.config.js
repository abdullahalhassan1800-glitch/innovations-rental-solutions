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
        // Premium dark charcoal + deep purple palette. "ink" is the light
        // foreground, "paper" the light edge/highlight colour, and
        // surface/night are the backgrounds. Keep these in sync with
        // app/globals.css.
        // Primary bg #1C1B20 · Secondary bg #252130 · Gradient accent #30234F
        // Purple highlight #352860 · Accent #A78BFA · Text #FFFFFF/#B8B3C5
        // Borders rgba(255,255,255,0.10)
        ink: "#ffffff",
        "ink-soft": "#b8b3c5",
        "ink-muted": "#8e88a5",
        cream: "#1c1b20",
        paper: "#ffffff",
        surface: "#252130",
        night: "#141319",
        sand: "#2a2438",
        "sand-deep": "#30234f",
        "violet-deep": "#352860",
        line: "#343240",
        forest: "#7c5ce8",
        "forest-deep": "#6a48db",
        "forest-soft": "#b7a6f2",
        brass: "#7c5ce8",
        "brass-soft": "#a492f5",
        "brass-pale": "#241b38",
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
