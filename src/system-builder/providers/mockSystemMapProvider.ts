import { mockMaps } from "../data/maps.js"
import { mockProjects } from "../data/projects.js"
import type { SystemMap, SystemNode } from "../types.js"
import type { SystemWorkspaceProvider } from "./systemMapProvider.js"

function cloneMap(map: SystemMap): SystemMap {
  return {
    projectId: map.projectId,
    nodes: map.nodes.map((node) => ({ ...node })),
    edges: map.edges.map((edge) => ({ ...edge }))
  }
}

function updateNodeInMap(map: SystemMap, node: SystemNode): SystemMap {
  return {
    ...map,
    nodes: map.nodes.map((item) => (item.id === node.id ? { ...node } : item))
  }
}

class MockSystemMapProvider implements SystemWorkspaceProvider {
  private maps = new Map(
    Object.entries(mockMaps).map(([projectId, map]) => [projectId, cloneMap(map)])
  )

  async getProjects() {
    return mockProjects.map((project) => ({ ...project }))
  }

  async getMap(projectId: string) {
    const map = this.maps.get(projectId)

    if (!map) {
      throw new Error(`Unknown system map project: ${projectId}`)
    }

    return cloneMap(map)
  }

  async updateNode(node: SystemNode) {
    const map = this.maps.get(this.getProjectIdByNode(node.id))

    if (!map) {
      throw new Error(`Unknown node project: ${node.id}`)
    }

    this.maps.set(map.projectId, updateNodeInMap(map, node))
  }

  async updateEdge(edge: SystemMap["edges"][number]) {
    const projectId = this.getProjectIdByEdge(edge.id)
    const map = this.maps.get(projectId)

    if (!map) {
      throw new Error(`Unknown edge project: ${edge.id}`)
    }

    this.maps.set(projectId, {
      ...map,
      edges: map.edges.map((item) => (item.id === edge.id ? { ...edge } : item))
    })
  }

  private getProjectIdByNode(nodeId: string) {
    const entry = Array.from(this.maps.entries()).find(([, map]) =>
      map.nodes.some((node) => node.id === nodeId)
    )

    if (!entry) {
      throw new Error(`Node not found: ${nodeId}`)
    }

    return entry[0]
  }

  private getProjectIdByEdge(edgeId: string) {
    const entry = Array.from(this.maps.entries()).find(([, map]) =>
      map.edges.some((edge) => edge.id === edgeId)
    )

    if (!entry) {
      throw new Error(`Edge not found: ${edgeId}`)
    }

    return entry[0]
  }
}

export const mockSystemMapProvider = new MockSystemMapProvider()
