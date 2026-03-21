import { ConsoleLayout } from "@/components/shell/ConsoleLayout"
import { InvokeConsole } from "@/components/invoke/InvokeConsole"

export default function InvokePage() {
  return (
    <ConsoleLayout>
      <div className="page-stack">
        <section className="hero">
          <div className="eyebrow">System Trigger</div>
          <h1 className="title">Invoke</h1>
          <p className="subtitle">
            Console-triggered MVP flow invocation. This page only collects payloads, triggers existing
            project protocols, and shows returned results.
          </p>
        </section>

        <InvokeConsole />
      </div>
    </ConsoleLayout>
  )
}
