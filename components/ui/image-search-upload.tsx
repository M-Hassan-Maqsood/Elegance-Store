"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, Search } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface ImageSearchUploadProps {
  onSearchResults: (results: any[], message?: string) => void
  onSearchStart: () => void
}

export function ImageSearchUpload({ onSearchResults, onSearchStart }: ImageSearchUploadProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB")
      return
    }

    setSelectedImage(file)
    setPreviewUrl(URL.createObjectURL(file))
    setError(null)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB")
      return
    }

    setSelectedImage(file)
    setPreviewUrl(URL.createObjectURL(file))
    setError(null)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setPreviewUrl(null)
  }

  const handleSearch = async () => {
    if (!selectedImage) return

    try {
      setIsSearching(true)
      onSearchStart()

      const formData = new FormData()
      formData.append("image", selectedImage)

      const response = await fetch("/api/image-search", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const data = await response.json()
      onSearchResults(data.results || [], data.message)
    } catch (error) {
      console.error("Error searching by image:", error)
      setError("Failed to search by image. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          previewUrl ? "border-gray-300" : "border-gray-400"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {previewUrl ? (
          <div className="relative">
            <Image
              src={previewUrl || "/placeholder.svg"}
              alt="Preview"
              width={300}
              height={300}
              className="mx-auto max-h-64 object-contain"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
              aria-label="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-8 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">Drag and drop an image here, or click to select a file</p>
            <p className="mt-1 text-xs text-gray-400">PNG, JPG, WEBP up to 5MB</p>
          </div>
        )}

        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <div className="mt-4">
        <Button onClick={handleSearch} disabled={!selectedImage || isSearching} className="w-full">
          {isSearching ? (
            "Searching..."
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Find Similar Products
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
