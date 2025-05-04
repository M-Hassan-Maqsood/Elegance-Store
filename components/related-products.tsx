import type { Product } from "@/lib/types"
import ProductCard from "./product-card"

interface RelatedProductsProps {
  products: Product[]
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) {
    return null
  }

  return (
    <section className="py-16">
      <h2 className="text-2xl font-playfair font-bold mb-8">You May Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.code} product={product} />
        ))}
      </div>
    </section>
  )
}
