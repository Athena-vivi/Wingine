import type { ProjectLayerState } from "../../../../system-builder/types.js"

type LayerStatusPanelProps = {
  layerState: ProjectLayerState | null
}

export function LayerStatusPanel({ layerState }: LayerStatusPanelProps) {
  return (
    <div className="grid gap-3">
      {layerState?.layers.map((layer) => (
        <div
          key={layer.layer}
          className="rounded-[14px] border border-slate-400/10 bg-slate-950/35 p-3"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="m-0 text-[14px] font-semibold capitalize text-slate-50">{layer.layer}</p>
              <p className="m-0 text-[12px] capitalize text-slate-400/70">{layer.status}</p>
            </div>
            <p className="m-0 text-[13px] text-slate-200">{layer.progress}%</p>
          </div>

          <div className="mb-3 h-2 rounded-full bg-slate-900">
            <div
              className="h-2 rounded-full bg-sky-400/80"
              style={{ width: `${layer.progress}%` }}
            />
          </div>

          <p className="mb-3 text-sm leading-6 text-slate-100/85">
            {layer.note ?? "No note available."}
          </p>

          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-slate-400/70">
              Issues {`(${layer.issues?.length ?? 0})`}
            </p>
            {layer.issues?.length ? (
              <ul className="m-0 list-disc space-y-1.5 pl-5 text-[13px] text-slate-200/80">
                {layer.issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            ) : (
              <p className="m-0 text-[13px] text-slate-300/70">No active issues recorded.</p>
            )}
          </div>
        </div>
      )) ?? <p className="m-0 text-slate-300/70">No layer state available.</p>}
    </div>
  )
}
