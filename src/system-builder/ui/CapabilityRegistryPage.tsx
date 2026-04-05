import { mockCapabilityProvider } from "../providers/mockCapabilityProvider.js"
import { mockSystemMapProvider } from "../providers/mockSystemMapProvider.js"
import { CapabilityList } from "./components/Capability/CapabilityList/CapabilityList.js"
import { Sidebar } from "./components/Sidebar/Sidebar.js"

export async function CapabilityRegistryPage() {
  const [capabilities, projects] = await Promise.all([
    mockCapabilityProvider.getAllCapabilities(),
    mockSystemMapProvider.getProjects()
  ])

  const defaultProjectId = projects[0]?.id ?? ""

  return (
    <div className="flex h-[calc(100vh-48px)] overflow-hidden bg-[#060913] max-[980px]:block max-[980px]:h-auto max-[980px]:overflow-visible">
      <Sidebar
        activeSection="capabilities"
        projects={projects}
        selectedProjectId=""
        defaultProjectId={defaultProjectId}
      />

      <main className="min-w-0 flex-1 overflow-y-auto p-6 max-[980px]:overflow-visible max-[980px]:p-4">
        <div className="rounded-[24px] border border-slate-400/10 bg-slate-900/35 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="mb-6">
            <p className="mb-2 text-[12px] uppercase tracking-[0.16em] text-slate-400/75">
              Capability Map
            </p>
            <h1 className="m-0 text-[32px] font-semibold text-slate-50">Capability Registry</h1>
          </div>

          <CapabilityList capabilities={capabilities} />
        </div>
      </main>
    </div>
  )
}
