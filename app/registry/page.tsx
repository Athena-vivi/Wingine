import { ConsoleLayout } from "@/components/shell/ConsoleLayout"
import { loadAllSystemRegistries } from "@/connectors/systems"

export default async function RegistryPage() {
  const systemRegistryManifests = await loadAllSystemRegistries()

  return (
    <ConsoleLayout>
      <div className="page-stack">
        <section className="hero">
          <div className="eyebrow">Contracts</div>
          <h1 className="title">Registry</h1>
          <p className="subtitle">
            System-wide capability, protocol, and shared flow contract view. This page reads integration
            boundaries only.
          </p>
        </section>

        {systemRegistryManifests.map((system) => (
          <section key={system.system} className="panel">
            <h2 style={{ textTransform: "capitalize" }}>{system.system}</h2>
            <p className="muted">
              {system.registry_endpoint} · {system.source_mode} · {system.registry_status}
            </p>
            <div className="grid two">
              <div>
                <h3>Capabilities</h3>
                <div className="chip-row">
                  {system.capabilities.map((capability) => (
                    <span key={capability} className="chip">
                      {capability}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3>Protocols</h3>
                <div className="chip-row">
                  {system.protocols.map((protocol) => (
                    <span key={protocol} className="chip">
                      {protocol}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="contract-table" style={{ marginTop: 18 }}>
              {Object.values(system.shared_flow_contracts.registry).map((contract) =>
                contract ? (
                  <div key={contract.name} className="contract-row">
                    <strong>{contract.name}</strong>
                    <span>{contract.producer}</span>
                    <span>{contract.consumer}</span>
                    <span className="muted">
                      {contract.input_type} -&gt; {contract.output_type}
                    </span>
                  </div>
                ) : null
              )}
            </div>
          </section>
        ))}
      </div>
    </ConsoleLayout>
  )
}
