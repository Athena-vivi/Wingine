import type { ProblemSignal, ProblemSignalStatus } from "../../../../system-builder/types.js"

const statuses: ProblemSignalStatus[] = ["raw", "clustered", "selected"]

type SignalDetailPanelProps = {
  signal: ProblemSignal | null
  onClose: () => void
  onStatusChange: (status: ProblemSignalStatus) => void
  onAddToBuilder: () => void
  embedded?: boolean
}

export function SignalDetailPanel({
  signal,
  onClose,
  onStatusChange,
  onAddToBuilder,
  embedded = false
}: SignalDetailPanelProps) {
  const content = (
    <>
      {signal ? (
        <>
          <div className="mb-[18px] flex items-start justify-between gap-3">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-slate-400/74">
                Signal Detail
              </p>
              <h2 className="m-0 text-[22px] text-slate-50">{signal.title}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-[12px] border border-slate-400/15 bg-slate-900/70 px-3 py-2 text-slate-200"
            >
              Close
            </button>
          </div>

          <dl className="mb-5 grid gap-3">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.1em] text-slate-400/72">Summary</dt>
              <dd className="m-0 leading-6 text-slate-50">
                {signal.summary ?? "No summary captured for this signal yet."}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.1em] text-slate-400/72">Status</dt>
              <dd className="m-0 text-slate-50">{signal.status}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.1em] text-slate-400/72">Cluster</dt>
              <dd className="m-0 text-slate-50">{signal.clusterId ?? "unassigned"}</dd>
            </div>
          </dl>

          <div className="mb-4">
            <p className="mb-3 text-[13px] font-semibold text-slate-200/92">Signal Status</p>
            <div className="grid grid-cols-3 gap-2.5">
              {statuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => onStatusChange(status)}
                  className={[
                    "rounded-[12px] border px-3 py-2.5 capitalize text-slate-200",
                    status === signal.status
                      ? "border-sky-400/40 bg-sky-400/16"
                      : "border-slate-400/15 bg-slate-900/70"
                  ].join(" ")}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onAddToBuilder}
            className="w-full rounded-[14px] border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100"
          >
            Add to Builder
          </button>
        </>
      ) : (
        <div className="grid gap-2">
          <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-slate-400/74">
            Signal Detail
          </p>
          <h2 className="m-0 text-[22px] text-slate-50">Select a signal</h2>
          <p className="m-0 leading-7 text-slate-300/72">
            Pick any problem signal in the radar field to inspect it and optionally push it toward builder space.
          </p>
        </div>
      )}
    </>
  )

  if (embedded) {
    return content
  }

  return (
    <aside className="absolute top-6 right-6 z-[2] min-h-[240px] w-[300px] rounded-[20px] border border-slate-400/15 bg-[#0a0f17]/90 p-5 shadow-[0_18px_48px_rgba(2,6,23,0.4)] backdrop-blur-[10px] max-[980px]:right-4 max-[980px]:bottom-4 max-[980px]:left-4 max-[980px]:top-auto max-[980px]:w-auto">
      {content}
    </aside>
  )
}
