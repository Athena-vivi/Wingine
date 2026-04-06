import type { ActiveSpace } from "../../../../system-builder/types.js"

const spaces: Array<{ id: ActiveSpace | "capabilities"; label: string }> = [
  { id: "problem-radar", label: "Breaker Space" },
  { id: "builder-space", label: "Builder Space" },
  { id: "capabilities", label: "Capability Registry" }
]

type SpaceSwitcherProps = {
  activeSpace?: ActiveSpace | "capabilities"
  getSpaceHref: (space: ActiveSpace | "capabilities") => string
}

export function SpaceSwitcher({ activeSpace, getSpaceHref }: SpaceSwitcherProps) {
  return (
    <section>
      <p className="mb-3 text-[12px] uppercase tracking-[0.12em] text-slate-400/70">
        Space Navigation
      </p>
      <div className="flex flex-col gap-[10px]">
        {spaces.map((space) => {
          const isActive = space.id === activeSpace

          return (
            <a
              key={space.id}
              href={getSpaceHref(space.id)}
              className={[
                "block w-full rounded-2xl border px-3 py-3 text-left text-[14px] font-medium transition-colors",
                isActive
                  ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
                  : "border-transparent bg-slate-900/50 text-slate-200 hover:border-emerald-400/20 hover:bg-slate-900/82"
              ].join(" ")}
            >
              {space.label}
            </a>
          )
        })}
      </div>
    </section>
  )
}
