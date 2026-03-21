import Link from "next/link"

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="max-w-xl text-center">
        <p className="section-kicker">Scoring</p>
        <h1 className="mt-4 font-serif text-4xl text-ink">Unified Evaluation System</h1>
        <p className="mt-4 text-base leading-7 text-muted">
          Single scoring system for Problem, Module, Output, and Workflow.
        </p>
        <div className="mt-8">
          <Link className="solid-button" href="/scoring">
            Open Scoring
          </Link>
        </div>
      </div>
    </main>
  )
}
