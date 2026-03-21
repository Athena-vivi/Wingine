import { ConsoleLayout } from "@/components/shell/ConsoleLayout"
import { loadAllSystemHealth } from "@/connectors/health"
import { loadAllSystemRegistries } from "@/connectors/systems"
import { MVP_FLOW_CONTRACTS } from "../../../SharedContracts"

export default async function OverviewPage() {
  const [systemRegistryManifests, systemHealth] = await Promise.all([
    loadAllSystemRegistries(),
    loadAllSystemHealth()
  ])
  const systemCount = systemRegistryManifests.length
  const capabilityCount = systemRegistryManifests.reduce((sum, item) => sum + item.capabilities.length, 0)
  const protocolCount = systemRegistryManifests.reduce((sum, item) => sum + item.protocols.length, 0)

  return (
    <ConsoleLayout>
      <div className="page-stack">
        <section className="hero">
          <div className="eyebrow">System Shell</div>
          <h1 className="title">Overview</h1>
          <p className="subtitle">
            Unified registry view for Radar, Builder, Scoring, and Betting. Console remains a shell:
            read, route, and summarize only.
          </p>
        </section>

        <section className="grid four">
          <div className="panel stat">
            <span className="muted">Systems</span>
            <span className="stat-value">{systemCount}</span>
          </div>
          <div className="panel stat">
            <span className="muted">Capabilities</span>
            <span className="stat-value">{capabilityCount}</span>
          </div>
          <div className="panel stat">
            <span className="muted">Protocols</span>
            <span className="stat-value">{protocolCount}</span>
          </div>
          <div className="panel stat">
            <span className="muted">MVP Flows</span>
            <span className="stat-value">{MVP_FLOW_CONTRACTS.length}</span>
          </div>
        </section>

        <section className="grid two">
          {systemRegistryManifests.map((system) => {
            const health = systemHealth.find((item) => item.system === system.system)

            return (
              <article key={system.system} className="panel">
                <h2 style={{ textTransform: "capitalize" }}>{system.system}</h2>
                <p className="muted">
                  {system.capabilities.length} capabilities, {system.protocols.length} protocols, source:{" "}
                  {system.source_mode}, status: {system.registry_status}
                </p>
                <div className="list">
                  <div className="list-row">
                    <strong>Outbound contracts</strong>
                    <div className="chip-row">
                      {system.shared_flow_contracts.outbound.map((name) => (
                        <span key={name} className="chip">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="list-row">
                    <strong>Inbound contracts</strong>
                    <div className="chip-row">
                      {system.shared_flow_contracts.inbound.map((name) => (
                        <span key={name} className="chip">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="list-row">
                    <strong>Registry endpoint</strong>
                    <span className="muted">{system.registry_endpoint}</span>
                  </div>
                  <div className="list-row">
                    <strong>Health</strong>
                    <span className="muted">
                      {health?.status ?? "fallback"} / activity {health?.activity_count ?? 0} / cache{" "}
                      {health?.protocol_cache_count ?? 0}
                      {typeof health?.feedback_state_count === "number" ? ` / feedback ${health.feedback_state_count}` : ""}
                    </span>
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      </div>
    </ConsoleLayout>
  )
}
