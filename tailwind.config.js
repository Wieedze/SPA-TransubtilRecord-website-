/** Transubtil Records design tokens (art direction 2026) — see src/assets/design/HANDOFF.md */
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          950: "#07060B", // main background
          900: "#100F16", // surfaces, form fields
          800: "#1B1A23", // cards, alternate sections
          700: "#2C2A36", // borders, dividers
          500: "#6F6C7A", // decoration and disabled only, never body text
          300: "#A8A5B0", // secondary text (8.3:1 on brand-950)
        },
        bone: "#F3EFE4", // primary text, logo (17.6:1 on brand-950)
        body: "#D6D2C8", // long-form paragraphs
        accent: {
          DEFAULT: "#F9BC14", // actions, links, landmarks (11.8:1 on brand-950)
          hover: "#FFD24D",
        },
        error: "#FF7A66",
        success: "#6FDB8F",
      },
      fontFamily: {
        display: ["Unbounded", "sans-serif"], // headings, artist names
        sans: ['"Instrument Sans"', "sans-serif"], // everything else
      },
      fontSize: {
        display: ["4.5rem", { lineHeight: "1.05", fontWeight: "800" }], // 72px, uppercase
        h1: ["3rem", { lineHeight: "1.1", fontWeight: "700" }], // 48px
        h2: ["2rem", { lineHeight: "1.25", fontWeight: "600" }], // 32px
        h3: ["1.375rem", { lineHeight: "1.35", fontWeight: "600" }], // 22px
        "body-lg": ["1.125rem", { lineHeight: "1.75rem" }], // 18px
        body: ["1rem", { lineHeight: "1.625rem" }], // 16px
        small: ["0.875rem", { lineHeight: "1.25rem" }], // 14px
        label: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.16em", fontWeight: "600" }], // 12px, uppercase
      },
      borderRadius: {
        field: "10px",
        photo: "6px",
        panel: "14px",
        card: "22px",
      },
      maxWidth: {
        page: "1280px",
      },
      keyframes: {
        breathe: { "0%,100%": { transform: "scale(1)" }, "50%": { transform: "scale(1.04)" } },
        halo: { "0%,100%": { opacity: "0.35" }, "50%": { opacity: "0.6" } },
      },
      animation: {
        "spin-slow": "spin 90s linear infinite", // home artwork background
        "spin-hub": "spin 60s linear infinite", // ring behind the artist hub
        breathe: "breathe 6s ease-in-out infinite", // home brandmark
        halo: "halo 6s ease-in-out infinite", // yellow glow behind the brandmark
      },
    },
  },
  plugins: [],
}
