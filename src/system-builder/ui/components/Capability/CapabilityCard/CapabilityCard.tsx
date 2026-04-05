import type { Capability, CapabilityStatus } from "../../../../../system-builder/types.js"

const statusClassMap: Record<CapabilityStatus, string> = {
  known: "bg-slate-700/70 text-slate-200",
  candidate: "bg-sky-400/15 text-sky-100",
  adopted: "bg-emerald-400/15 text-emerald-100"
}

type CapabilityCardProps = {
  capability: Capability
}

export function CapabilityCard({ capability }: CapabilityCardProps) {
  return (
    <article className="rounded-[18px] border border-slate-400/10 bg-slate-900/50 p-4 shadow-[0_10px_28px_rgba(2,6,23,0.16)]">
      <h2 className="m-0 text-[18px] font-semibold text-slate-50">{capability.name}</h2>

      <dl className="mt-4 grid gap-2 text-sm text-slate-200/84">
        <div>
          <dt className="mb-1 text-[11px] uppercase tracking-[0.12em] text-slate-400/68">Layer</dt>
          <dd className="m-0 capitalize">{capability.layer}</dd>
        </div>
        <div>
          <dt className="mb-1 text-[11px] uppercase tracking-[0.12em] text-slate-400/68">Source</dt>
          <dd className="m-0 capitalize">
            {capability.sourceType ?? "unknown"}
          </dd>
        </div>
        <div>
          <dt className="mb-1 text-[11px] uppercase tracking-[0.12em] text-slate-400/68">Location</dt>
          <dd className="m-0 break-all text-slate-300/80">{capability.location ?? "Not recorded"}</dd>
        </div>
        <div>
          <dt className="mb-1 text-[11px] uppercase tracking-[0.12em] text-slate-400/68">Status</dt>
          <dd className="m-0">
            <span className={["inline-block rounded-full px-2.5 py-1 text-[11px] font-medium capitalize", statusClassMap[capability.status]].join(" ")}>
              {capability.status}
            </span>
          </dd>
        </div>
        <div>
          <dt className="mb-1 text-[11px] uppercase tracking-[0.12em] text-slate-400/68">Description</dt>
          <dd className="m-0 leading-6 text-slate-200/88">{capability.description}</dd>
        </div>
      </dl>
    </article>
  )
}
