import typography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1200px",
      },
    },
    extend: {
      colors: {
        background: "#0d1821",
        surface: "#10202d",
        card: "#122534",
        border: "#1e3442",
        accent: "#30a6e6",
        accent2: "#1e9bd9",
        success: "#22c55e",
        warning: "#f97316",
        danger: "#ef4444",
        muted: "#9ca3af",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        display: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
      },
      boxShadow: {
        card: "0 10px 40px rgba(0,0,0,0.35)",
      },
      borderRadius: {
        lg: "12px",
        md: "10px",
        sm: "8px",
      },
    },
  },
  plugins: [animate, typography],
};

export default config;
