import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "VisualClause Console",
  description: "Unified console for Radar, Builder, Scoring, and Betting."
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
