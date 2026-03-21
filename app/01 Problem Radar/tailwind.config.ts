import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#f5f5f3",
        ink: "#1f2937",
        border: "#e5e7eb",
        accent: "#111827",
        muted: "#6b7280",
        success: "#166534",
        warning: "#92400e"
      },
      boxShadow: {
        card: "0 12px 30px rgba(15, 23, 42, 0.06)"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
}

export default config
