import type { Metadata } from "next"

import "./globals.css"

export const metadata: Metadata = {
  title: "Builder",
  description: "Builder Console MVP for moving problems into workflow, capabilities, and output."
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
