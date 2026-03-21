"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/overview", label: "Overview" },
  { href: "/objects", label: "Objects" },
  { href: "/flows", label: "Flows" },
  { href: "/trace", label: "Trace" },
  { href: "/activity", label: "Activity" },
  { href: "/invoke", label: "Invoke" },
  { href: "/registry", label: "Registry" }
]

export function ConsoleNav() {
  const pathname = usePathname()

  return (
    <aside className="console-nav">
      <div className="hero">
        <div className="eyebrow">VisualClause</div>
        <h1 className="title" style={{ fontSize: 26 }}>
          Console
        </h1>
        <p className="subtitle">Unified shell for Radar, Builder, Scoring, and Betting.</p>
      </div>

      <nav className="nav-group" aria-label="Console navigation">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link${pathname === item.href ? " active" : ""}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
