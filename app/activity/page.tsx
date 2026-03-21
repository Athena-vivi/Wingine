import { ConsoleLayout } from "@/components/shell/ConsoleLayout"
import { loadAllSystemActivity } from "@/connectors/activity"
import Link from "next/link"

export default async function ActivityPage() {
  const systems = await loadAllSystemActivity()

  return (
    <ConsoleLayout>
      <div className="page-stack">
        <section className="hero">
          <div className="eyebrow">Runtime Activity</div>
          <h1 className="title">Activity</h1>
          <p className="subtitle">
            Contract invocation log across Radar, Builder, Scoring, and Betting. This page shows protocol
            activity and flow handoff results without owning business logic.
          </p>
        </section>

        {systems.map((system) => (
          <section key={system.system} className="panel">
            <h2 style={{ textTransform: "capitalize" }}>{system.system}</h2>
            <p className="muted">
              {system.endpoint} · {system.source_mode} · {system.status}
            </p>

            <div className="contract-table" style={{ marginTop: 18 }}>
              {system.events.length === 0 ? (
                <div className="contract-row">
                  <strong>No activity yet</strong>
                  <span />
                  <span />
                  <span className="muted">No contract invocation logs available.</span>
                </div>
              ) : (
                system.events.map((event) => (
                  <div key={event.id} className="contract-row">
                    <strong>{event.protocol_name}</strong>
                    <span>{event.contract_name ?? "protocol-only"}</span>
                    <span>{event.status}</span>
                    <span className="muted">
                      {event.input_id ? (
                        <Link href={`/trace?objectId=${encodeURIComponent(event.input_id)}`}>{event.input_id}</Link>
                      ) : (
                        "no-input"
                      )}{" "}
                      -&gt;{" "}
                      {event.output_id ? (
                        <Link href={`/trace?objectId=${encodeURIComponent(event.output_id)}`}>{event.output_id}</Link>
                      ) : (
                        "no-output"
                      )}{" "}
                      · {event.timestamp}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        ))}
      </div>
    </ConsoleLayout>
  )
}
