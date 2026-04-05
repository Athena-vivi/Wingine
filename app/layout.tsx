import type { ReactNode } from "react"
import "./globals.css"
import { ProtocolBar } from "../src/system-builder/ui/components/ProtocolBar/ProtocolBar.js"

export const metadata = {
  title: "Wingine System Builder Workspace"
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <ProtocolBar />
        <div className="pt-12 max-[980px]:pt-[72px]">{children}</div>
      </body>
    </html>
  )
}
