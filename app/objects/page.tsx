import { ConsoleLayout } from "@/components/shell/ConsoleLayout"
import { loadObjectManifests } from "@/connectors/objects"

export default function ObjectsPage() {
  const objects = loadObjectManifests()

  return (
    <ConsoleLayout>
      <div className="page-stack">
        <section className="hero">
          <div className="eyebrow">Shared Objects</div>
          <h1 className="title">Objects</h1>
          <p className="subtitle">
            Unified object layer across Radar, Builder, Scoring, and Betting. This page shows ownership,
            visibility, and next flow options for each shared object type.
          </p>
        </section>

        <section className="grid two">
          {objects.map((object) => (
            <article key={object.type} className="panel">
              <h2 style={{ textTransform: "capitalize" }}>{object.type}</h2>
              <div className="list">
                <div className="list-row">
                  <strong>Owner systems</strong>
                  <div className="chip-row">
                    {object.owner_systems.map((system) => (
                      <span key={system} className="chip">
                        {system}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="list-row">
                  <strong>Visible in systems</strong>
                  <div className="chip-row">
                    {object.visible_in_systems.map((system) => (
                      <span key={system} className="chip">
                        {system}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="list-row">
                  <strong>Inbound contracts</strong>
                  <div className="chip-row">
                    {object.inbound_contracts.map((name) => (
                      <span key={name} className="chip">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="list-row">
                  <strong>Outbound contracts</strong>
                  <div className="chip-row">
                    {object.outbound_contracts.map((name) => (
                      <span key={name} className="chip">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="list-row">
                  <strong>Next flow options</strong>
                  <div className="chip-row">
                    {object.next_contracts.map((name) => (
                      <span key={name} className="chip">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="list-row">
                  <strong>Status family</strong>
                  <div className="chip-row">
                    {object.status_family.map((status) => (
                      <span key={status} className="chip">
                        {status}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </ConsoleLayout>
  )
}
