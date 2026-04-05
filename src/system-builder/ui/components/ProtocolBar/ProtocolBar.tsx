const protocol = {
  phase: "Control Layer Build",
  focus: "Only build system structure and visualization",
  allowed: ["Builder", "Overview", "Capability Registry"],
  blocked: ["MCP", "external integration", "automation", "module execution"]
}

export function ProtocolBar() {
  return (
    <div className="fixed top-0 right-0 left-0 z-50 h-12 border-b border-slate-400/10 bg-[#08101a]/92">
      <div className="flex h-full items-center gap-4 overflow-hidden px-4 text-[12px] text-slate-300/82 max-[980px]:grid max-[980px]:h-auto max-[980px]:gap-1.5 max-[980px]:px-4 max-[980px]:py-2">
        <div className="shrink-0 text-slate-100">
          <span className="text-slate-400/70">Phase:</span> {protocol.phase}
        </div>
        <div className="min-w-0 flex-1 truncate">
          <span className="text-slate-400/70">Focus:</span> {protocol.focus}
        </div>
        <div className="min-w-0 truncate">
          <span className="text-slate-400/70">Allowed:</span> {protocol.allowed.join(" / ")}
        </div>
        <div className="min-w-0 truncate text-slate-300/70">
          <span className="text-slate-400/70">Blocked:</span> {protocol.blocked.join(" / ")}
        </div>
      </div>
    </div>
  )
}
