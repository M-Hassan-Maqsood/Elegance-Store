import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getProductById, getRelatedProducts } from "@/lib/api"
import { formatPrice } from "@/lib/utils"
import { ProductGallery } from "@/components/ui/product-gallery"
import { ProductActions } from "@/components/ui/product-actions"
import { ProductGrid } from "@/components/ui/product-grid"

interface ProductPageProps {
  params: {
    code: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductById(params.code)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.ID, product.Category)

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
          {/* Product gallery */}
          <div className="lg:max-w-lg lg:self-end">
            <Suspense fallback={<div>Loading product images...</div>}>
              <ProductGallery productId={product.ID} productName={product["Product Name"]} />
            </Suspense>
          </div>

          {/* Product details */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product["Product Name"]}</h1>

            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl tracking-tight text-gray-900">{formatPrice(product.Price)}</p>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <div className="space-y-6 text-base text-gray-700">
                <p>{product["Product Description"]}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-700">
                Availability: <span className="font-medium">{product.Availability}</span>
              </p>
            </div>

            {product.Color && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900">Color</h3>
                <p className="mt-1 text-sm text-gray-500">{product.Color}</p>
              </div>
            )}

            {/* Size selector and add to cart (client component) */}
            <ProductActions product={product} />
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <Suspense fallback={<div>Loading related products...</div>}>
              <ProductGrid products={relatedProducts} title="You may also like" />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  )
}
