"use client"

import { useState } from "react"
import { ImageSearchUpload } from "@/components/ui/image-search-upload"
import { ProductGrid } from "@/components/ui/product-grid"
import type { Product } from "@/types/product"

export default function VisualSearchPage() {
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSearchResults = (results: any[], infoMessage?: string) => {
    // Convert the results to match our Product type
    const products: Product[] = results.map((result) => ({
      Id: result.Id || 0,
      ID: result.ID || "",
      "Product Name": result["Product Name"] || "",
      "Product Description": result["Product Description"] || "",
      Price: result.Price || 0,
      Category: result.Category || "",
      "Img Path": result["Img Path"] || "",
      "Product Link": result["Product Link"] || "",
      Availability: result.Availability || "",
      Color: result.Color || "",
      Sizes: result.Sizes || "S, M, L", // Default value
      featured: result.featured || false,
      created_at: result.created_at || "",
      updated_at: result.updated_at || "",
    }))

    setSearchResults(products)
    setIsSearching(false)
    setHasSearched(true)
    setMessage(infoMessage || null)
  }

  const handleSearchStart = () => {
    setIsSearching(true)
    setHasSearched(false)
    setMessage(null)
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Visual Search</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-500">
            Upload an image to find similar clothing items in our collection
          </p>
        </div>

        <div className="mt-12">
          <ImageSearchUpload onSearchResults={handleSearchResults} onSearchStart={handleSearchStart} />
        </div>

        <div className="mt-16">
          {isSearching ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-gray-500">Searching for similar products...</p>
            </div>
          ) : hasSearched ? (
            <>
              {message && (
                <div className="mb-8 p-4 bg-blue-50 text-blue-700 rounded-md">
                  <p>{message}</p>
                </div>
              )}
              {searchResults.length > 0 ? (
                <>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">Products</h2>
                  <ProductGrid products={searchResults} />
                </>
              ) : (
                <div className="text-center py-12">
                  <h2 className="text-xl font-medium text-gray-900">No products found</h2>
                  <p className="mt-2 text-gray-500">Try uploading a different image or browse our collections</p>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
