import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#121212",
        paper: "#ffffff",
        meta: "#666666",
        rule: "#dcdcdc",
        wash: "#f5f4f2",
        brand: {
          // #3092c0 is the house blue. It clears contrast as a fill and a
          // rule, not as small text — `ink` and `dark` carry those roles.
          DEFAULT: "#3092c0",
          ink: "#1c6488",
          dark: "#26759b",
          tint: "#eaf3f8",
        },
      },
      maxWidth: {
        page: "1200px",
        measure: "40rem",
      },
    },
  },
  plugins: [],
};

export default config;
