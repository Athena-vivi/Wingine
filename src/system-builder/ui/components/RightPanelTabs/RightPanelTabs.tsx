import type { RightPanelTab } from "../../../../system-builder/types.js"

const tabs: Array<{ id: RightPanelTab; label: string }> = [
  { id: "detail", label: "Detail" },
  { id: "overview", label: "Overview" },
  { id: "layers", label: "Layers" },
  { id: "modules", label: "Modules" }
]

type RightPanelTabsProps = {
  activeTab: RightPanelTab
  onChange: (tab: RightPanelTab) => void
}

export function RightPanelTabs({ activeTab, onChange }: RightPanelTabsProps) {
  return (
    <div className="mb-4 grid grid-cols-4 gap-2 rounded-[14px] border border-slate-400/10 bg-slate-950/35 p-1">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={[
              "rounded-[10px] px-2 py-2 text-[12px] font-medium transition-colors",
              isActive
                ? "bg-slate-800 text-slate-50"
                : "text-slate-400 hover:bg-slate-900/70 hover:text-slate-200"
            ].join(" ")}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
