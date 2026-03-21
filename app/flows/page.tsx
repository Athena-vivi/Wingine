import { ConsoleLayout } from "@/components/shell/ConsoleLayout"
import {
  getFeedbackFlowContracts,
  getMainFlowContracts,
  loadAllSystemRegistries
} from "@/connectors/systems"

export default async function FlowsPage() {
  const systemRegistryManifests = await loadAllSystemRegistries()
  const mainChain = getMainFlowContracts()
  const feedbackChain = getFeedbackFlowContracts()

  return (
    <ConsoleLayout>
      <div className="page-stack">
        <section className="hero">
          <div className="eyebrow">System Flow</div>
          <h1 className="title">Flows</h1>
          <p className="subtitle">
            Shared flow contract view for the full system. This page shows forward chain, feedback chain,
            and per-system boundaries only.
          </p>
        </section>

        <section className="panel">
          <h2>Main Chain</h2>
          <div className="contract-table">
            {mainChain.map((contract) => (
              <div key={contract.name} className="contract-row">
                <strong>{contract.name}</strong>
                <span>{contract.producer}</span>
                <span>{contract.consumer}</span>
                <span className="muted">
                  {contract.input_type} -&gt; {contract.output_type}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Feedback Chain</h2>
          <div className="contract-table">
            {feedbackChain.map((contract) => (
              <div key={contract.name} className="contract-row">
                <strong>{contract.name}</strong>
                <span>{contract.producer}</span>
                <span>{contract.consumer}</span>
                <span className="muted">
                  {contract.input_type} -&gt; {contract.output_type}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid two">
          {systemRegistryManifests.map((system) => (
            <article key={system.system} className="panel">
              <h2 style={{ textTransform: "capitalize" }}>{system.system}</h2>
              <div className="list">
                <div className="list-row">
                  <strong>Outbound</strong>
                  <div className="chip-row">
                    {system.shared_flow_contracts.outbound.map((name) => (
                      <span key={name} className="chip">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="list-row">
                  <strong>Inbound</strong>
                  <div className="chip-row">
                    {system.shared_flow_contracts.inbound.map((name) => (
                      <span key={name} className="chip">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="list-row">
                  <strong>Boundary</strong>
                  <span className="muted">{system.registry_endpoint}</span>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </ConsoleLayout>
  )
}
