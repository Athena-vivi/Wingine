import {
  mockModuleRegistries,
  mockProjectLayerStates,
  mockProjectStatuses
} from "../data/workspaceStatus.js"
import type { WorkspaceStatusProvider } from "./systemMapProvider.js"

class MockWorkspaceStatusProvider implements WorkspaceStatusProvider {
  async getProjectStatus(projectId: string) {
    const status = mockProjectStatuses[projectId]

    if (!status) {
      throw new Error(`Unknown project status: ${projectId}`)
    }

    return {
      ...status,
      blockers: [...status.blockers]
    }
  }

  async getProjectLayerState(projectId: string) {
    const layerState = mockProjectLayerStates[projectId]

    if (!layerState) {
      throw new Error(`Unknown project layer state: ${projectId}`)
    }

    return {
      projectId: layerState.projectId,
      layers: layerState.layers.map((layer) => ({
        ...layer,
        issues: [...(layer.issues ?? [])]
      }))
    }
  }

  async getModuleRegistry(projectId: string) {
    const registry = mockModuleRegistries[projectId]

    if (!registry) {
      throw new Error(`Unknown module registry: ${projectId}`)
    }

    return {
      projectId: registry.projectId,
      candidates: registry.candidates.map((candidate) => ({ ...candidate }))
    }
  }
}

export const mockWorkspaceStatusProvider = new MockWorkspaceStatusProvider()
