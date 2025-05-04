"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@supabase/supabase-js"
import { Loader2, Plus, Trash2 } from "lucide-react"
import ImageUploader from "../image-uploader"

// Create a Supabase client for the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface ProductImageManagerProps {
  productCode: string
  initialImageUrl?: string | null
  onImageUpdate?: (url: string) => void
}

interface ProductImage {
  name: string
  url: string
}

export default function ProductImageManager({ productCode, initialImageUrl, onImageUpdate }: ProductImageManagerProps) {
  const [mainImage, setMainImage] = useState<string | null>(initialImageUrl || null)
  const [additionalImages, setAdditionalImages] = useState<ProductImage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProductImages() {
      if (!productCode) return

      setIsLoading(true)

      try {
        // List all files in the product's folder
        const { data, error } = await supabase.storage.from("product-images").list(productCode)

        if (error) {
          console.error("Error fetching product images:", error)
          return
        }

        if (data && data.length > 0) {
          const images = data
            .filter((file) => !file.id.includes(".DS_Store")) // Filter out system files
            .map((file) => {
              const url = supabase.storage.from("product-images").getPublicUrl(`${productCode}/${file.name}`)
                .data.publicUrl
              return {
                name: file.name,
                url,
              }
            })

          // Find the main image (image_0)
          const mainImg = images.find(
            (img) => img.name === "image_0.jpg" || img.name === "image_0.png" || img.name === "image_0.jpeg",
          )
          if (mainImg) {
            setMainImage(mainImg.url)
          }

          // Set additional images (excluding the main one)
          setAdditionalImages(images.filter((img) => img !== mainImg))
        }
      } catch (error) {
        console.error("Error in fetchProductImages:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProductImages()
  }, [productCode])

  const handleMainImageUpdate = (url: string) => {
    setMainImage(url)
    if (onImageUpdate) {
      onImageUpdate(url)
    }
  }

  const handleDeleteImage = async (imageName: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return

    try {
      const { error } = await supabase.storage.from("product-images").remove([`${productCode}/${imageName}`])

      if (error) {
        console.error("Error deleting image:", error)
        alert("Failed to delete image")
        return
      }

      // Update the UI
      if (imageName.startsWith("image_0")) {
        setMainImage(null)
      } else {
        setAdditionalImages(additionalImages.filter((img) => !img.name.includes(imageName)))
      }
    } catch (error) {
      console.error("Error deleting image:", error)
      alert("Failed to delete image")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Images</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="main">
          <TabsList className="mb-4">
            <TabsTrigger value="main">Main Image</TabsTrigger>
            <TabsTrigger value="additional">Additional Images</TabsTrigger>
          </TabsList>

          <TabsContent value="main">
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  {mainImage ? (
                    <div className="relative">
                      <div className="relative h-[300px] w-full">
                        <Image
                          src={mainImage || "/placeholder.svg"}
                          alt="Main product image"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => handleDeleteImage("image_0.jpg")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-gray-100 h-[300px] flex items-center justify-center rounded-md">
                      <p className="text-gray-500">No main image uploaded</p>
                    </div>
                  )}

                  <div className="pt-4">
                    <h3 className="text-sm font-medium mb-2">Upload Main Image</h3>
                    <ImageUploader productCode={productCode} imageIndex="0" onUploadComplete={handleMainImageUpdate} />
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="additional">
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {additionalImages.map((image, index) => (
                      <div key={image.name} className="relative">
                        <div className="relative h-[150px] w-full">
                          <Image
                            src={image.url || "/placeholder.svg"}
                            alt={`Product image ${index + 1}`}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => handleDeleteImage(image.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <div className="border-2 border-dashed border-gray-300 rounded-md h-[150px] flex flex-col items-center justify-center p-4">
                      <Plus className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 text-center">Upload additional image</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h3 className="text-sm font-medium mb-2">Upload Additional Image</h3>
                    <ImageUploader
                      productCode={productCode}
                      imageIndex={`${additionalImages.length + 1}`}
                      onUploadComplete={(url) => {
                        setAdditionalImages([
                          ...additionalImages,
                          {
                            name: `image_${additionalImages.length + 1}.jpg`,
                            url,
                          },
                        ])
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
