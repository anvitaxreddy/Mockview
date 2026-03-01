/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6C3CE1",
          light: "#8B5CF6",
          dark: "#5521C6",
        },
        accent: {
          DEFAULT: "#00D4AA",
          light: "#34E8C4",
          dark: "#00B892",
        },
        surface: {
          DEFAULT: "#1E1E2E",
          light: "#2A2A3E",
          dark: "#0F0F1A",
          card: "#1A1A2E",
        },
        danger: "#FF6B6B",
        warning: "#FFB347",
        text: {
          primary: "#F0F0F5",
          secondary: "#A0A0B5",
          muted: "#6B6B80",
        },
      },
      fontFamily: {
        display: ['"Clash Display"', '"DM Sans"', "sans-serif"],
        body: ['"DM Sans"', '"Inter"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(108, 60, 225, 0.3)" },
          "100%": { boxShadow: "0 0 40px rgba(108, 60, 225, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};
