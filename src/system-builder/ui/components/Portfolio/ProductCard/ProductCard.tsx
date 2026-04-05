import type { ProductHealth, ProductStage, ProductStatusCard } from "../../../../../system-builder/types.js"

const stageClassMap: Record<ProductStage, string> = {
  idea: "bg-slate-700/70 text-slate-200",
  mapping: "bg-violet-400/15 text-violet-100",
  protocol: "bg-sky-400/15 text-sky-100",
  module: "bg-cyan-400/15 text-cyan-100",
  control: "bg-orange-400/15 text-orange-100",
  execution: "bg-emerald-400/15 text-emerald-100",
  paused: "bg-slate-800 text-slate-300"
}

const healthClassMap: Record<ProductHealth, string> = {
  clear: "bg-emerald-400/15 text-emerald-100",
  partial: "bg-yellow-400/15 text-yellow-100",
  blocked: "bg-rose-400/15 text-rose-100",
  drifting: "bg-slate-700/70 text-slate-200"
}

type ProductCardProps = {
  product: ProductStatusCard
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <a
      href={`/workspace?projectId=${product.id}&space=builder-space`}
      className="block rounded-[20px] border border-slate-400/10 bg-slate-900/55 p-5 shadow-[0_10px_28px_rgba(2,6,23,0.18)] transition-colors hover:border-slate-300/12 hover:bg-slate-900/75"
    >
      <p className="mb-1 text-[12px] uppercase tracking-[0.14em] text-slate-400/65">{product.category}</p>
      <h2 className="m-0 text-[20px] font-semibold text-slate-50">{product.name}</h2>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className={["rounded-full px-2.5 py-1 text-[11px] font-medium capitalize", stageClassMap[product.stage]].join(" ")}>
          {product.stage}
        </span>
        <span className={["rounded-full px-2.5 py-1 text-[11px] font-medium capitalize", healthClassMap[product.health]].join(" ")}>
          {product.health}
        </span>
      </div>

      <div className="mt-5 grid gap-4">
        <div>
          <p className="mb-1 text-[12px] font-medium text-slate-400/70">Current focus</p>
          <p className="m-0 text-sm leading-6 text-slate-200/90">{product.currentFocus}</p>
        </div>

        <div>
          <p className="mb-1 text-[12px] font-medium text-slate-400/70">Next step</p>
          <p className="m-0 text-sm leading-6 text-slate-200/90">{product.nextStep}</p>
        </div>

        {product.lastNote ? (
          <p className="m-0 rounded-[12px] border border-slate-400/8 bg-slate-950/40 px-3 py-2 text-[12px] leading-6 text-slate-300/78">
            {product.lastNote}
          </p>
        ) : null}
      </div>
    </a>
  )
}
