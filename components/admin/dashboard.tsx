"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProductList from "./product-list"
import ImportProducts from "./import-products"
import UploadImages from "./upload-images"
import BulkImageUpload from "./bulk-image-upload"
import { createClient } from "@supabase/supabase-js"
import type { Product } from "@/lib/types"

// Create a Supabase client for the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching products:", error)
      } else {
        setProducts(data || [])
      }
      setLoading(false)
    }

    fetchProducts()
  }, [])

  const refreshProducts = async () => {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error refreshing products:", error)
    } else {
      setProducts(data || [])
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <Tabs defaultValue="products">
        <TabsList className="mb-8">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="import">Import CSV</TabsTrigger>
          <TabsTrigger value="upload">Upload Images</TabsTrigger>
          <TabsTrigger value="bulk-upload">Bulk Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductList products={products} loading={loading} onRefresh={refreshProducts} />
        </TabsContent>

        <TabsContent value="import">
          <ImportProducts onImportComplete={refreshProducts} />
        </TabsContent>

        <TabsContent value="upload">
          <UploadImages products={products} onUploadComplete={refreshProducts} />
        </TabsContent>

        <TabsContent value="bulk-upload">
          <BulkImageUpload products={products} onUploadComplete={refreshProducts} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
