import type { ProductStatusCard } from "../../../../../system-builder/types.js"
import { ProductCard } from "../ProductCard/ProductCard.js"

type ProductGridProps = {
  products: ProductStatusCard[]
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
