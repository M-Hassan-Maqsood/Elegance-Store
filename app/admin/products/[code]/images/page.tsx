"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@supabase/supabase-js"
import { ArrowLeft } from "lucide-react"
import ProductImageManager from "@/components/admin/product-image-manager"
import type { Product } from "@/lib/types"

// Create a Supabase client for the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function ProductImagesPage({ params }: { params: { code: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true)
      const { data, error } = await supabase.from("products").select("*").eq("code", params.code).single()

      if (error) {
        console.error("Error fetching product:", error)
      } else {
        setProduct(data)
      }
      setLoading(false)
    }

    fetchProduct()
  }, [params.code])

  const handleImageUpdate = async (url: string) => {
    if (!product) return

    try {
      const { error } = await supabase.from("products").update({ image_url: url }).eq("code", product.code)

      if (error) {
        console.error("Error updating product image URL:", error)
      } else {
        setProduct({ ...product, image_url: url })
      }
    } catch (error) {
      console.error("Error updating product image URL:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">Loading product...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">Product not found</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Manage Images: {product.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Product Details</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Code</dt>
                <dd>{product.code}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd>{product.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd>{product.category}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Price</dt>
                <dd>Rs. {product.price.toLocaleString()}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="md:col-span-2">
          <ProductImageManager
            productCode={product.code}
            initialImageUrl={product.image_url}
            onImageUpdate={handleImageUpdate}
          />
        </div>
      </div>
    </div>
  )
}
