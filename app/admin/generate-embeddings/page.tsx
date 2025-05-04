"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Database, Loader2 } from "lucide-react"

export default function GenerateEmbeddingsPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateEmbeddings = async () => {
    try {
      setIsGenerating(true)
      setError(null)

      const response = await fetch("/api/generate-embeddings", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`Failed to generate embeddings: ${response.statusText}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Error generating embeddings:", error)
      setError("Failed to generate embeddings. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Generate Product Embeddings</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-500">
            Generate embeddings for product images to enable visual search functionality
          </p>
        </div>

        <div className="mt-12 max-w-lg mx-auto">
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <p className="text-gray-700 mb-4">
              This process will generate embeddings for product images that don't have them yet. It may take some time
              depending on the number of products.
            </p>

            <div className="bg-yellow-50 p-4 rounded-md mb-6">
              <p className="text-yellow-700">
                Note: Embedding generation requires TensorFlow.js Node which is not available in the current
                environment. In a production setup, this would be handled by a separate microservice or serverless
                function.
              </p>
            </div>

            <Button onClick={handleGenerateEmbeddings} disabled={isGenerating} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking Products...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Check Products
                </>
              )}
            </Button>

            {error && <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}

            {result && (
              <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-md">
                <h3 className="font-medium">Information:</h3>
                <p>{result.message}</p>
                {result.info && <p className="mt-2">{result.info}</p>}
                {result.products && (
                  <div className="mt-2">
                    <p>Products checked: {result.products.length}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
