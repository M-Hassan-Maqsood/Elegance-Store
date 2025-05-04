"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload } from "lucide-react"
import type { Product } from "@/lib/types"
import Image from "next/image"

interface UploadImagesProps {
  products: Product[]
  onUploadComplete: () => Promise<void>
}

export default function UploadImages({ products, onUploadComplete }: UploadImagesProps) {
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [files, setFiles] = useState<FileList | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProduct(e.target.value)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct || !files || files.length === 0) return

    setLoading(true)
    setResult(null)

    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("productCode", selectedProduct)
        formData.append("imageIndex", index.toString())

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        return response.json()
      })

      const results = await Promise.all(uploadPromises)
      const success = results.every((result) => !result.error)

      setResult({
        success,
        message: success ? `Successfully uploaded ${files.length} image(s)` : "Some images failed to upload",
      })

      if (success) {
        await onUploadComplete()
      }
    } catch (error) {
      console.error("Error uploading images:", error)
      setResult({
        success: false,
        message: "An unexpected error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  const product = products.find((p) => p.code === selectedProduct)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Upload Product Images</h2>

        <p className="text-gray-600 mb-6">
          Select a product and upload one or more images. The first image will be used as the main product image.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
              Select Product
            </label>
            <select
              id="product"
              value={selectedProduct}
              onChange={handleProductChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">-- Select a product --</option>
              {products.map((product) => (
                <option key={product.code} value={product.code}>
                  {product.code} - {product.name}
                </option>
              ))}
            </select>
          </div>

          {product && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Product Details:</h3>
              <div className="bg-gray-50 p-4 rounded">
                <p>
                  <strong>Name:</strong> {product.name}
                </p>
                <p>
                  <strong>Category:</strong> {product.category}
                </p>
                <p>
                  <strong>Price:</strong> Rs. {product.price.toLocaleString()}
                </p>
                {product.image_url && (
                  <div className="mt-2">
                    <p>
                      <strong>Current Image:</strong>
                    </p>
                    <div className="relative h-40 w-40 mt-1">
                      <Image
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
              Product Images
            </label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              required
              disabled={!selectedProduct}
            />
            <p className="text-xs text-gray-500 mt-1">
              You can select multiple images. They will be named image_0.jpg, image_1.jpg, etc.
            </p>
          </div>

          <Button
            type="submit"
            disabled={!selectedProduct || !files || files.length === 0 || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" /> Upload Images
              </>
            )}
          </Button>
        </form>

        {result && (
          <Alert className={`mt-6 ${result.success ? "bg-green-50" : "bg-red-50"}`}>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}

        <div className="mt-8">
          <h3 className="font-medium mb-2">Image Structure:</h3>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
            ├── ACA231001/
            <br />│ ├── image_0.jpg
            <br />│ └── image_1.jpg
            <br />
            ├── ACA231002/
            <br />│ └── image_0.jpg
            <br />
            └── AJ230601/
            <br />
            └── image_0.jpg
          </pre>
        </div>
      </div>
    </div>
  )
}
