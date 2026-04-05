"use client"

import { useEffect, useMemo, useState } from "react"
import { mockSystemMapProvider } from "../providers/mockSystemMapProvider.js"
import {
  mockProblemRadarProvider,
  mockProblemSignalBuilderAdapter
} from "../providers/mockProblemRadarProvider.js"
import type {
  ActiveSpace,
  ModuleRegistry,
  NodeStatus,
  ProjectLayerState,
  ProjectStatus,
  ProblemRadarMap,
  ProblemSignal,
  ProblemSignalStatus,
  RightPanelTab,
  SystemMap,
  SystemNode,
  SystemProject
} from "../types.js"
import { BuilderStarMap } from "./components/BuilderStarMap/BuilderStarMap.js"
import { ProblemRadar } from "./components/ProblemRadar/ProblemRadar.js"
import { RightPanel } from "./components/RightPanel/RightPanel.js"
import { Sidebar } from "./components/Sidebar/Sidebar.js"
import { mockWorkspaceStatusProvider } from "../providers/mockWorkspaceStatusProvider.js"

const builderProvider = mockSystemMapProvider
const problemProvider = mockProblemRadarProvider
const problemSignalAdapter = mockProblemSignalBuilderAdapter
const workspaceStatusProvider = mockWorkspaceStatusProvider

type SystemBuilderWorkspaceProps = {
  initialProjectId?: string
  initialSpace?: ActiveSpace
}

export function SystemBuilderWorkspace({
  initialProjectId,
  initialSpace = "builder-space"
}: SystemBuilderWorkspaceProps) {
  const [activeSpace, setActiveSpace] = useState<ActiveSpace>(initialSpace)
  const [activePanelTab, setActivePanelTab] = useState<RightPanelTab>("detail")
  const [projects, setProjects] = useState<SystemProject[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId ?? "")
  const [systemMap, setSystemMap] = useState<SystemMap | null>(null)
  const [problemRadar, setProblemRadar] = useState<ProblemRadarMap | null>(null)
  const [projectStatus, setProjectStatus] = useState<ProjectStatus | null>(null)
  const [projectLayerState, setProjectLayerState] = useState<ProjectLayerState | null>(null)
  const [moduleRegistry, setModuleRegistry] = useState<ModuleRegistry | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null)
  const [isBuilderLoading, setIsBuilderLoading] = useState(true)
  const [isProblemLoading, setIsProblemLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadProjects() {
      const nextProjects = await builderProvider.getProjects()
      if (!active) {
        return
      }

      setProjects(nextProjects)
      setSelectedProjectId(initialProjectId ?? nextProjects[0]?.id ?? "")
    }

    loadProjects()

    return () => {
      active = false
    }
  }, [initialProjectId])

  useEffect(() => {
    if (initialProjectId) {
      setSelectedProjectId(initialProjectId)
    }
  }, [initialProjectId])

  useEffect(() => {
    setActiveSpace(initialSpace)
  }, [initialSpace])

  useEffect(() => {
    if (!selectedProjectId) {
      return
    }

    let active = true
    setIsBuilderLoading(true)
    setIsProblemLoading(true)

    async function loadProjectSpaces() {
      const [nextMap, nextRadar, nextProjectStatus, nextLayerState, nextModuleRegistry] = await Promise.all([
        builderProvider.getMap(selectedProjectId),
        problemProvider.getRadar(selectedProjectId),
        workspaceStatusProvider.getProjectStatus(selectedProjectId),
        workspaceStatusProvider.getProjectLayerState(selectedProjectId),
        workspaceStatusProvider.getModuleRegistry(selectedProjectId)
      ])

      if (!active) {
        return
      }

      setSystemMap(nextMap)
      setProblemRadar(nextRadar)
      setProjectStatus(nextProjectStatus)
      setProjectLayerState(nextLayerState)
      setModuleRegistry(nextModuleRegistry)
      setSelectedNodeId((currentNodeId) =>
        nextMap.nodes.some((node) => node.id === currentNodeId) ? currentNodeId : null
      )
      setSelectedSignalId((currentSignalId) =>
        nextRadar.signals.some((signal) => signal.id === currentSignalId) ? currentSignalId : null
      )
      setIsBuilderLoading(false)
      setIsProblemLoading(false)
    }

    loadProjectSpaces()

    return () => {
      active = false
    }
  }, [selectedProjectId])

  const selectedNode = useMemo(() => {
    return systemMap?.nodes.find((node) => node.id === selectedNodeId) ?? null
  }, [selectedNodeId, systemMap])

  const selectedSignal = useMemo(() => {
    return problemRadar?.signals.find((signal) => signal.id === selectedSignalId) ?? null
  }, [problemRadar, selectedSignalId])

  async function handleStatusChange(status: NodeStatus) {
    if (!selectedNode || !systemMap) {
      return
    }

    const updatedNode: SystemNode = { ...selectedNode, status }

    await builderProvider.updateNode(updatedNode)

    setSystemMap({
      ...systemMap,
      nodes: systemMap.nodes.map((node) => (node.id === updatedNode.id ? updatedNode : node))
    })
  }

  async function handleSignalStatusChange(status: ProblemSignalStatus) {
    if (!selectedSignal || !problemRadar) {
      return
    }

    const updatedSignal: ProblemSignal = { ...selectedSignal, status }

    await problemProvider.updateSignal(updatedSignal)

    setProblemRadar({
      ...problemRadar,
      signals: problemRadar.signals.map((signal) =>
        signal.id === updatedSignal.id ? updatedSignal : signal
      )
    })
  }

  async function handleAddToBuilder() {
    if (!selectedSignal || !selectedProjectId) {
      return
    }

    await problemSignalAdapter.addToBuilder(selectedProjectId, selectedSignal)
  }

  useEffect(() => {
    if (!selectedProjectId) {
      return
    }

    if (typeof window !== "undefined" && window.location.pathname === "/workspace") {
      window.history.replaceState(
        null,
        "",
        `/workspace?projectId=${selectedProjectId}&space=${activeSpace}`
      )
    }
  }, [activeSpace, selectedProjectId])

  return (
    <div className="flex h-[calc(100vh-48px)] overflow-hidden bg-[#060913] max-[980px]:block max-[980px]:h-auto max-[980px]:overflow-visible">
      <Sidebar
        activeSection={activeSpace}
        projects={projects}
        selectedProjectId={selectedProjectId}
        defaultProjectId={projects[0]?.id || ""}
      />

      <main className="min-w-0 flex-1 overflow-y-auto p-6 max-[980px]:overflow-visible max-[980px]:p-4">
        <div className="relative h-[calc(100vh-96px)] min-h-[640px] overflow-hidden rounded-[24px] border border-slate-400/10 bg-slate-900/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] max-[980px]:h-auto max-[980px]:min-h-[720px]">
          {activeSpace === "builder-space" && systemMap ? (
            <>
              <BuilderStarMap
                map={systemMap}
                selectedNodeId={selectedNodeId}
                onNodeSelect={setSelectedNodeId}
                isLoading={isBuilderLoading}
              />
            </>
          ) : null}

          {activeSpace === "problem-radar" && problemRadar ? (
            <>
              <ProblemRadar
                radar={problemRadar}
                selectedSignalId={selectedSignalId}
                onSignalSelect={setSelectedSignalId}
                isLoading={isProblemLoading}
              />
            </>
          ) : null}

          <RightPanel
            activeSpace={activeSpace}
            activeTab={activePanelTab}
            projectStatus={projectStatus}
            layerState={projectLayerState}
            moduleRegistry={moduleRegistry}
            node={selectedNode}
            signal={selectedSignal}
            onTabChange={setActivePanelTab}
            onCloseNode={() => setSelectedNodeId(null)}
            onCloseSignal={() => setSelectedSignalId(null)}
            onNodeStatusChange={handleStatusChange}
            onSignalStatusChange={handleSignalStatusChange}
            onAddToBuilder={handleAddToBuilder}
          />
        </div>
      </main>
    </div>
  )
}
