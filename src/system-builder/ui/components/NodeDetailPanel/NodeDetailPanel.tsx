import type { NodeStatus, SystemNode } from "../../../../system-builder/types.js"

const statuses: NodeStatus[] = ["undefined", "defined", "connected", "stable"]

type NodeDetailPanelProps = {
  node: SystemNode | null
  onClose: () => void
  onStatusChange: (status: NodeStatus) => void
  embedded?: boolean
}

export function NodeDetailPanel({
  node,
  onClose,
  onStatusChange,
  embedded = false
}: NodeDetailPanelProps) {
  const content = (
    <>
      {node ? (
        <>
          <div className="mb-[18px] flex items-start justify-between gap-3">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-slate-400/74">Node Detail</p>
              <h2 className="m-0 text-[22px] text-slate-50">{node.name}</h2>
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
              <dt className="text-[11px] uppercase tracking-[0.1em] text-slate-400/72">ID</dt>
              <dd className="m-0 text-slate-50">{node.id}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.1em] text-slate-400/72">Layer</dt>
              <dd className="m-0 text-slate-50">{node.layer}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.1em] text-slate-400/72">Position</dt>
              <dd className="m-0 text-slate-50">
                {node.x}, {node.y}
              </dd>
            </div>
          </dl>

          <div>
            <p className="mb-3 text-[13px] font-semibold text-slate-200/92">Status</p>
            <div className="grid grid-cols-2 gap-2.5">
              {statuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => onStatusChange(status)}
                  className={[
                    "rounded-[12px] border px-3 py-2.5 capitalize text-slate-200",
                    status === node.status
                      ? "border-sky-400/40 bg-sky-400/16"
                      : "border-slate-400/15 bg-slate-900/70"
                  ].join(" ")}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="grid gap-2">
          <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-slate-400/74">Node Detail</p>
          <h2 className="m-0 text-[22px] text-slate-50">Select a node</h2>
          <p className="m-0 leading-7 text-slate-300/72">
            Pick any system node on the star map to inspect its layer and update its state.
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
