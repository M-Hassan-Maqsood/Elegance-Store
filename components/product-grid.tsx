import type { Product } from "@/lib/types"
import ProductCard from "./product-card"

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-600">No products found</h2>
        <p className="text-gray-500 mt-2">Try adjusting your filters or check back later.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.code} product={product} />
      ))}
    </div>
  )
}
