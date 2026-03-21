import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
    "./types/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        paper: "#f6f3ee",
        shell: "#fcfbf8",
        border: "#ddd6cb",
        ink: "#25211d",
        muted: "#6f685f",
        accent: "#6f7c8c",
        accentSoft: "#e6ebf0",
        warm: "#a86f43",
        success: "#54705d",
        warning: "#967247"
      },
      boxShadow: {
        desk: "0 18px 48px rgba(37, 33, 29, 0.08)"
      },
      fontFamily: {
        sans: ["Avenir Next", "Segoe UI", "Helvetica Neue", "sans-serif"],
        serif: ["Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Georgia", "serif"]
      }
    }
  },
  plugins: []
}

export default config
