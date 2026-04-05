import { mockPortfolioProvider } from "../providers/mockPortfolioProvider.js"
import { mockSystemMapProvider } from "../providers/mockSystemMapProvider.js"
import { ProductGrid } from "./components/Portfolio/ProductGrid/ProductGrid.js"
import { Sidebar } from "./components/Sidebar/Sidebar.js"

export async function PortfolioOverviewPage() {
  const [products, projects] = await Promise.all([
    mockPortfolioProvider.getAllProducts(),
    mockSystemMapProvider.getProjects()
  ])

  const defaultProjectId = projects[0]?.id ?? ""

  return (
    <div className="flex h-[calc(100vh-48px)] overflow-hidden bg-[#060913] max-[980px]:block max-[980px]:h-auto max-[980px]:overflow-visible">
      <Sidebar
        activeSection="overview"
        projects={projects}
        selectedProjectId=""
        defaultProjectId={defaultProjectId}
      />

      <main className="min-w-0 flex-1 overflow-y-auto p-6 max-[980px]:overflow-visible max-[980px]:p-4">
        <div className="rounded-[24px] border border-slate-400/10 bg-slate-900/35 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="mb-6">
            <p className="mb-2 text-[12px] uppercase tracking-[0.16em] text-slate-400/75">
              Portfolio
            </p>
            <h1 className="m-0 text-[32px] font-semibold text-slate-50">System Overview</h1>
            <p className="mt-3 mb-0 max-w-3xl text-sm leading-7 text-slate-300/78">
              A portfolio-layer view of the products currently inside the Wingine shell. This page is only a selection layer: it shows where each product stands and lets you enter the corresponding workspace.
            </p>
          </div>

          <ProductGrid products={products} />
        </div>
      </main>
    </div>
  )
}
