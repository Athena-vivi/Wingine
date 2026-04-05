import { mockRadars } from "../data/radars.js"
import type { ProblemRadarMap, ProblemSignal } from "../types.js"
import type { ProblemRadarProvider, ProblemSignalBuilderAdapter } from "./systemMapProvider.js"

function cloneRadar(radar: ProblemRadarMap): ProblemRadarMap {
  return {
    projectId: radar.projectId,
    clusters: radar.clusters.map((cluster) => ({ ...cluster })),
    signals: radar.signals.map((signal) => ({ ...signal }))
  }
}

class MockProblemRadarProvider implements ProblemRadarProvider {
  private radars = new Map(
    Object.entries(mockRadars).map(([projectId, radar]) => [projectId, cloneRadar(radar)])
  )

  async getRadar(projectId: string) {
    const radar = this.radars.get(projectId)

    if (!radar) {
      throw new Error(`Unknown radar project: ${projectId}`)
    }

    return cloneRadar(radar)
  }

  async updateSignal(signal: ProblemSignal) {
    const projectId = this.getProjectIdBySignal(signal.id)
    const radar = this.radars.get(projectId)

    if (!radar) {
      throw new Error(`Unknown signal project: ${signal.id}`)
    }

    this.radars.set(projectId, {
      ...radar,
      signals: radar.signals.map((item) => (item.id === signal.id ? { ...signal } : item))
    })
  }

  private getProjectIdBySignal(signalId: string) {
    const entry = Array.from(this.radars.entries()).find(([, radar]) =>
      radar.signals.some((signal) => signal.id === signalId)
    )

    if (!entry) {
      throw new Error(`Signal not found: ${signalId}`)
    }

    return entry[0]
  }
}

class MockProblemSignalBuilderAdapter implements ProblemSignalBuilderAdapter {
  private promotedSignals = new Map<string, ProblemSignal[]>()

  async addToBuilder(projectId: string, signal: ProblemSignal) {
    const nextSignals = [...(this.promotedSignals.get(projectId) ?? []), { ...signal }]
    this.promotedSignals.set(projectId, nextSignals)
    console.log("[mock-add-to-builder]", projectId, signal.id)
  }
}

export const mockProblemRadarProvider = new MockProblemRadarProvider()
export const mockProblemSignalBuilderAdapter = new MockProblemSignalBuilderAdapter()
