import { ConsoleLayout } from "@/components/shell/ConsoleLayout"
import { loadObjectTrace } from "@/connectors/objectTrace"
import { loadTraceManifests } from "@/connectors/trace"

type TracePageProps = {
  searchParams?: Promise<{
    objectId?: string
  }>
}

export default async function TracePage({ searchParams }: TracePageProps) {
  const traces = loadTraceManifests()
  const params = searchParams ? await searchParams : undefined
  const objectId = params?.objectId
  const objectTrace = objectId ? await loadObjectTrace(objectId) : null

  return (
    <ConsoleLayout>
      <div className="page-stack">
        <section className="hero">
          <div className="eyebrow">System Trace</div>
          <h1 className="title">Trace</h1>
          <p className="subtitle">
            Contract-level trace view for the system. This page shows how shared objects traverse the main
            chain and how feedback flows return upstream.
          </p>
        </section>

        {objectTrace ? (
          <section className="panel">
            <h2>Object Trace</h2>
            <p className="muted">{objectTrace.object_id}</p>
            <div className="chip-row" style={{ marginBottom: 14 }}>
              {objectTrace.systems.map((system) => (
                <span key={system} className="chip">
                  {system}
                </span>
              ))}
              {objectTrace.contracts.map((contract) => (
                <span key={contract} className="chip">
                  {contract}
                </span>
              ))}
            </div>

            <div className="contract-table">
              {objectTrace.events.length === 0 ? (
                <div className="contract-row">
                  <strong>No trace events</strong>
                  <span />
                  <span />
                  <span className="muted">No invocation log references found for this object id.</span>
                </div>
              ) : (
                objectTrace.events.map((event) => (
                  <div key={event.id} className="contract-row">
                    <strong>{event.protocol_name}</strong>
                    <span>{event.system}</span>
                    <span>{event.role}</span>
                    <span className="muted">
                      {event.contract_name ?? "protocol-only"} · {event.status} · {event.timestamp}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        ) : null}

        {traces.map((trace) => (
          <section key={trace.name} className="panel">
            <h2>{trace.name}</h2>
            <div className="contract-table">
              {trace.steps.map((step) => (
                <div key={`${trace.name}-${step.contract}`} className="contract-row">
                  <strong>
                    {step.order}. {step.contract}
                  </strong>
                  <span>{step.producer}</span>
                  <span>{step.consumer}</span>
                  <span className="muted">
                    {step.input_type} -&gt; {step.output_type} · {step.mode}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </ConsoleLayout>
  )
}
