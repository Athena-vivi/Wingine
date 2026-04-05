import type { ProblemCluster, ProblemRadarMap } from "../../../../system-builder/types.js"
import { ProblemSignal } from "../ProblemSignal/ProblemSignal.js"

const clusterStyles: Array<{ x: number; y: number; color: string }> = [
  { x: 22, y: 30, color: "rgba(56, 189, 248, 0.10)" },
  { x: 56, y: 40, color: "rgba(125, 211, 252, 0.08)" },
  { x: 78, y: 68, color: "rgba(59, 130, 246, 0.09)" },
  { x: 40, y: 72, color: "rgba(148, 163, 184, 0.06)" }
]

type ProblemRadarProps = {
  radar: ProblemRadarMap
  selectedSignalId: string | null
  onSignalSelect: (signalId: string) => void
  isLoading: boolean
}

function clusterStyleFor(cluster: ProblemCluster, index: number) {
  return clusterStyles[index] ?? clusterStyles[cluster.id.length % clusterStyles.length]
}

export function ProblemRadar({
  radar,
  selectedSignalId,
  onSignalSelect,
  isLoading
}: ProblemRadarProps) {
  return (
    <div
      className="relative h-full w-full overflow-hidden bg-[#090c12]"
      style={{
        background:
          "radial-gradient(circle at 20% 20%, #131722, #090c12), #090c12"
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0,transparent_62%)]" />

      {radar.clusters.map((cluster, index) => {
        const style = clusterStyleFor(cluster, index)

        return (
          <div
            key={cluster.id}
            className="pointer-events-none absolute h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{
              left: `${style.x}%`,
              top: `${style.y}%`,
              background: style.color
            }}
          />
        )
      })}

      <div className="pointer-events-none absolute inset-0">
        {radar.clusters.map((cluster, index) => {
          const style = clusterStyleFor(cluster, index)

          return (
            <div
              key={`${cluster.id}-label`}
              className="absolute text-[11px] uppercase tracking-[0.16em] text-slate-400/40"
              style={{
                left: `${style.x}%`,
                top: `calc(${style.y}% - 92px)`
              }}
            >
              {cluster.name}
            </div>
          )
        })}
      </div>

      <div className="absolute inset-0">
        {radar.signals.map((signal) => (
          <ProblemSignal
            key={signal.id}
            signal={signal}
            selected={signal.id === selectedSignalId}
            onClick={() => onSignalSelect(signal.id)}
          />
        ))}
      </div>

      {isLoading ? (
        <div className="absolute inset-0 grid place-items-center bg-[#090c12]/35 text-[12px] uppercase tracking-[0.08em] text-slate-200/90">
          Loading problem radar...
        </div>
      ) : null}
    </div>
  )
}
