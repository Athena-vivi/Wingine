import type { ProblemSignal, ProblemSignalStatus } from "../../../../system-builder/types.js"

const statusColorMap: Record<ProblemSignalStatus, string> = {
  raw: "#7dd3fc",
  clustered: "#38bdf8",
  selected: "#bfdbfe"
}

type ProblemSignalProps = {
  signal: ProblemSignal
  selected: boolean
  onClick: () => void
}

export function ProblemSignal({ signal, selected, onClick }: ProblemSignalProps) {
  const color = statusColorMap[signal.status]
  const baseSize = 2 + Math.round((signal.heat ?? 0.5) * 3)
  const size = selected ? baseSize + 2 : baseSize

  return (
    <button
      type="button"
      className="group absolute -translate-x-1/2 -translate-y-1/2 border-0 bg-transparent p-0"
      onClick={onClick}
      style={{
        left: `${signal.x}%`,
        top: `${signal.y}%`
      }}
      aria-label={signal.title}
    >
      <span
        className="block rounded-full ring-1 ring-white/8 transition duration-150"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          opacity: selected ? 0.95 : 0.7,
          boxShadow: selected ? `0 0 14px ${color}33` : `0 0 8px ${color}22`
        }}
      />
      <span
        className={[
          "pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-950/90 px-2 py-1 text-[12px] text-slate-200 transition duration-150",
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        ].join(" ")}
      >
        {signal.title}
      </span>
    </button>
  )
}
