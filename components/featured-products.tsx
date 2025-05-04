import type { Product } from "@/lib/types"
import ProductCard from "./product-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface FeaturedProductsProps {
  products: Product[]
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-6">Featured Collection</h2>
        <div className="w-24 h-1 bg-black mx-auto mb-6"></div>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Discover our handpicked selection of premium clothing pieces designed for elegance and comfort
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="text-center mt-16">
        <Link href="/products">
          <Button
            variant="outline"
            size="lg"
            className="border-black text-black hover:bg-black hover:text-white px-8 py-6 text-base"
          >
            View All Products
          </Button>
        </Link>
      </div>
    </section>
  )
}
