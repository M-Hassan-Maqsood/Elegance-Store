"use client"

import { useState } from "react"
import Image from "next/image"
import { Camera } from "lucide-react"
import { ProductGrid } from "@/components/ui/product-grid"
import type { Product } from "@/types/product"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function LensPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    
    if (selectedFile) {
      setFile(selectedFile)
      const filePreview = URL.createObjectURL(selectedFile)
      setPreview(filePreview)
    }
  }

  // Handle visual search submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      setMessage("Please select an image first")
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      // Create form data for file upload
      const formData = new FormData()
      formData.append("image", file)

      // Call the image search API endpoint
      const response = await fetch("/api/image-search", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      console.log("Image search response:", data) // Debug log

      if (!response.ok) {
        throw new Error(data.error || "Error searching for similar products")
      }

      // Check for success and results in the response (from Python backend)
      if (data.success && data.results && data.results.length > 0) {
        // Extract the product IDs
        const productIds = data.results.map((item: any) => item.product_id).filter(Boolean)
        
        console.log("Found product IDs:", productIds) // Debug log
        
        if (productIds.length === 0) {
          setMessage("Found similar items but couldn't identify product IDs")
          setSearchResults([])
          setHasSearched(true)
          return
        }
        
        // Fetch complete product details for the similar items
        const productsResponse = await fetch("/api/products/by-ids", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids: productIds }),
        })
        
        const productsData = await productsResponse.json()
        console.log("Products data response:", productsData) // Debug log
        
        if (productsData.products && productsData.products.length > 0) {
          setSearchResults(productsData.products)
          setHasSearched(true)
          setMessage(null)
        } else {
          setMessage("Found similar items but couldn't retrieve product details")
          setSearchResults([])
        }
      } else {
        setMessage("No similar products found")
        setSearchResults([])
      }
    } catch (error) {
      console.error("Error searching with image:", error)
      setMessage("Failed to find matching products. Please try again.")
      setSearchResults([])
    } finally {
      setIsLoading(false)
      setHasSearched(true)
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Camera className="h-16 w-16 text-black" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Search with Lens</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-500">
            Find similar styles by uploading an image or taking a photo
          </p>
        </div>

        <div className="mt-12 max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image upload container */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer text-center"
                 onClick={() => document.getElementById("image-upload")?.click()}>
              {preview ? (
                <div className="relative w-full h-64 mx-auto">
                  <Image 
                    src={preview} 
                    alt="Preview" 
                    fill 
                    className="object-contain" 
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Camera className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="text-gray-600">Click to upload an image or take a photo</p>
                  <p className="text-gray-400 text-sm">JPG, PNG or GIF (max. 5MB)</p>
                </div>
              )}
              <input 
                type="file"
                id="image-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            
            {/* Search button */}
            <Button 
              type="submit" 
              disabled={!file || isLoading}
              className="w-full py-3 px-4 bg-black hover:bg-black/90 text-white text-lg font-medium"
            >
              {isLoading ? "Searching..." : "Search with this image"}
            </Button>
          </form>
        </div>

        {/* Results section */}
        <div className="mt-16">
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-gray-500">Finding similar styles...</p>
            </div>
          )}

          {!isLoading && hasSearched && (
            <>
              {message && (
                <div className="mb-8 p-4 bg-blue-50 text-blue-700 rounded-md">
                  <p>{message}</p>
                </div>
              )}
              
              {searchResults.length > 0 ? (
                <>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">We found these similar styles</h2>
                  <ProductGrid products={searchResults} />
                </>
              ) : (
                <div className="text-center py-12">
                  <h2 className="text-xl font-medium text-gray-900">No matching styles found</h2>
                  <p className="mt-2 text-gray-500">Try uploading a different image or browse our collections</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}