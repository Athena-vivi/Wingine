import { mockPortfolioProducts } from "../data/portfolio.js"
import type { PortfolioProvider } from "./systemMapProvider.js"

class MockPortfolioProvider implements PortfolioProvider {
  async getAllProducts() {
    return mockPortfolioProducts.map((product) => ({ ...product }))
  }
}

export const mockPortfolioProvider = new MockPortfolioProvider()
