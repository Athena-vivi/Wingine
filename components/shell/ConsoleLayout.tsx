import { ConsoleNav } from "@/components/shell/ConsoleNav"

export function ConsoleLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="console-shell">
      <ConsoleNav />
      <main className="console-main">{children}</main>
    </div>
  )
}
