import { mockCapabilities } from "../data/capabilities.js"
import type { CapabilityProvider } from "./systemMapProvider.js"

class MockCapabilityProvider implements CapabilityProvider {
  async getAllCapabilities() {
    return mockCapabilities.map((capability) => ({ ...capability }))
  }
}

export const mockCapabilityProvider = new MockCapabilityProvider()
