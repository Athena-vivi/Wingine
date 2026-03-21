import Link from "next/link"

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="max-w-xl text-center">
        <p className="section-kicker">Betting</p>
        <h1 className="mt-4 font-serif text-4xl text-ink">Callable Resource Allocation System</h1>
        <p className="mt-4 text-base leading-7 text-muted">
          Decide how much to invest from score, confidence, trend, and cost.
        </p>
        <div className="mt-8">
          <Link className="solid-button" href="/betting">
            Open Betting
          </Link>
        </div>
      </div>
    </main>
  )
}
