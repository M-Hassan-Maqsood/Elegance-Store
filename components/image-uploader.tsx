"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Upload, Check, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ImageUploaderProps {
  productCode: string
  onUploadComplete?: (url: string) => void
  imageIndex?: string
  className?: string
}

export default function ImageUploader({
  productCode,
  onUploadComplete,
  imageIndex = "0",
  className,
}: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{
    success: boolean
    message: string
    url?: string
  } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setUploadStatus(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadStatus(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("productCode", productCode)
      formData.append("imageIndex", imageIndex)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setUploadStatus({
          success: true,
          message: "Image uploaded successfully",
          url: data.url,
        })
        if (onUploadComplete && data.url) {
          onUploadComplete(data.url)
        }
      } else {
        setUploadStatus({
          success: false,
          message: data.error || "Failed to upload image",
        })
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      setUploadStatus({
        success: false,
        message: "An unexpected error occurred",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        <Input type="file" accept="image/*" onChange={handleFileChange} disabled={isUploading} className="flex-1" />
        <Button onClick={handleUpload} disabled={!file || isUploading} className="min-w-[100px]">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" /> Upload
            </>
          )}
        </Button>
      </div>

      {uploadStatus && (
        <Alert className={uploadStatus.success ? "bg-green-50" : "bg-red-50"}>
          <div className="flex items-center gap-2">
            {uploadStatus.success ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>{uploadStatus.message}</AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  )
}
