import { Suspense } from "react"
import { searchProducts } from "@/lib/api"
import { ProductGrid } from "@/components/ui/product-grid"

interface SearchPageProps {
  searchParams: {
    q?: string
    color?: string
    category?: string
    minPrice?: string
    maxPrice?: string
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ""
  const color = searchParams.color || ""
  const category = searchParams.category || ""
  const minPrice = searchParams.minPrice ? parseInt(searchParams.minPrice) : undefined
  const maxPrice = searchParams.maxPrice ? parseInt(searchParams.maxPrice) : undefined
  
  // Get search results based on query
  let products = query ? await searchProducts(query) : []
  
  // Apply additional filters if provided
  if (color) {
    products = products.filter(product => 
      product.Color?.toLowerCase().includes(color.toLowerCase())
    )
  }
  
  if (category) {
    products = products.filter(product => 
      product.Category?.toLowerCase().includes(category.toLowerCase())
    )
  }
  
  if (minPrice !== undefined) {
    products = products.filter(product => {
      const price = parseInt(product.Price?.replace(/,/g, "") || "0")
      return price >= minPrice
    })
  }
  
  if (maxPrice !== undefined) {
    products = products.filter(product => {
      const price = parseInt(product.Price?.replace(/,/g, "") || "0")
      return price <= maxPrice
    })
  }

  // Construct a search description for display
  let searchDescription = `"${query}"`
  if (color) searchDescription += ` in ${color} color`
  if (category) searchDescription += ` (${category})`
  if (minPrice && maxPrice) {
    searchDescription += ` between Rs. ${minPrice} and Rs. ${maxPrice}`
  } else if (maxPrice) {
    searchDescription += ` under Rs. ${maxPrice}`
  } else if (minPrice) {
    searchDescription += ` over Rs. ${minPrice}`
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Search Results for {searchDescription}</h1>
        <p className="mt-2 text-sm text-gray-500">{products.length} products found</p>

        <Suspense fallback={<div>Searching...</div>}>
          <div className="mt-6">
            {products.length > 0 ? (
              <ProductGrid products={products} />
            ) : (
              <div className="text-center py-12">
                <h2 className="text-lg font-medium text-gray-900">No products found</h2>
                <p className="mt-2 text-sm text-gray-500">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
              </div>
            )}
          </div>
        </Suspense>
      </div>
    </div>
  )
}
