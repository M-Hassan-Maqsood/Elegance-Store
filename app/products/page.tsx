import { Suspense } from "react"
import { getAllProducts, getProductsByCode } from "@/lib/api"
import { ProductGrid } from "@/components/ui/product-grid"
import { Button } from "@/components/ui/button"

interface ProductsPageProps {
  searchParams: {
    codes?: string
    page?: string
    limit?: string
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const PRODUCTS_PER_PAGE = 10
  const page = searchParams.page ? parseInt(searchParams.page) : 1
  const limit = searchParams.limit ? parseInt(searchParams.limit) : PRODUCTS_PER_PAGE
  
  // Handle product codes from URL parameters
  const codes = searchParams.codes?.split(',').filter(Boolean) || []
  
  // If we have product codes, get products by code, otherwise get all products
  const products = codes.length > 0 
    ? await getProductsByCode(codes) 
    : await getAllProducts()
  
  // Calculate pagination - show all products up to the current page instead of just current page
  const start = 0 // Start from the first product
  const end = page * limit // Show all products up to current page limit
  const cumulativeProducts = products.slice(start, end)
  const hasMore = end < products.length
  
  const searchDescription = codes.length > 0 
    ? `Selected Products`
    : "All Products" 

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {searchDescription}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {products.length} products found
          {page > 1 && `, showing ${cumulativeProducts.length} products`}
        </p>

        <Suspense fallback={<div>Loading products...</div>}>
          <div className="mt-6">
            {cumulativeProducts.length > 0 ? (
              <>
                <ProductGrid products={cumulativeProducts} />
                
                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <a
                        href={`/products?codes=${searchParams.codes || ''}&page=${page + 1}&limit=${limit}`}
                      >
                        Load more
                      </a>
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-lg font-medium text-gray-900">No products found</h2>
                <p className="mt-2 text-sm text-gray-500">
                  Try a different selection or browse our categories.
                </p>
                <Button className="mt-4" asChild>
                  <a href="/categories">Browse Categories</a>
                </Button>
              </div>
            )}
          </div>
        </Suspense>
      </div>
    </div>
  )
}
