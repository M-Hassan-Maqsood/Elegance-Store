"use client"

import type React from "react"
;("")

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Loader2, Check, AlertCircle } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client for the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function BulkImageUpload() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 })
  const [uploadStatus, setUploadStatus] = useState<{ success: boolean; message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files)
      setUploadStatus(null)
    }
  }

  const handleUpload = async () => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    setProgress(0)
    setResults({ success: 0, failed: 0 })
    setUploadStatus(null)

    const totalFiles = files.length
    let successCount = 0
    let failedCount = 0

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i]

      try {
        // Extract product ID and image index from filename
        // Expected formats:
        // - ALR103_0.jpg (productId_imageIndex.ext)
        // - ALR103/image_0.jpg (productId/image_imageIndex.ext)
        let productId = ""
        let imageName = ""

        const fileName = file.name

        // Check if filename contains a path separator
        if (fileName.includes("/") || fileName.includes("\\")) {
          const parts = fileName.split(/[/\\]/)
          productId = parts[0]
          imageName = parts[parts.length - 1]
        } else {
          // Try to extract product ID from filename (e.g., ALR103_0.jpg)
          const match = fileName.match(/^([A-Za-z0-9]+)_(\d+)\./)
          if (match) {
            productId = match[1]
            const imageIndex = match[2]
            imageName = `image_${imageIndex}.${fileName.split(".").pop()}`
          } else {
            // If no pattern matches, skip this file
            failedCount++
            continue
          }
        }

        if (!productId) {
          failedCount++
          continue
        }

        // Upload to Supabase Storage
        const { error } = await supabase.storage.from("product-images").upload(`${productId}/${imageName}`, file, {
          cacheControl: "3600",
          upsert: true,
        })

        if (error) {
          console.error(`Error uploading ${fileName}:`, error)
          failedCount++
        } else {
          successCount++
        }
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error)
        failedCount++
      }

      // Update progress
      const currentProgress = Math.round(((i + 1) / totalFiles) * 100)
      setProgress(currentProgress)
      setResults({ success: successCount, failed: failedCount })
    }

    setUploadStatus({
      success: failedCount === 0,
      message: `Upload complete: ${successCount} successful, ${failedCount} failed`,
    })

    setIsUploading(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Bulk Image Upload</h2>

        <p className="text-gray-600 mb-6">
          Upload multiple product images at once. Files should follow one of these naming patterns:
        </p>

        <ul className="list-disc pl-5 text-sm text-gray-600 mb-6 space-y-1">
          <li>
            <code>ProductID_ImageNumber.jpg</code> (e.g., ALR103_0.jpg, DSTY675_1.jpg)
          </li>
          <li>
            <code>ProductID/image_ImageNumber.jpg</code> (e.g., ALR103/image_0.jpg)
          </li>
        </ul>

        <div className="space-y-6">
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={isUploading}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can select multiple images. Make sure filenames follow the required pattern.
            </p>
          </div>

          <Button onClick={handleUpload} disabled={!files || files.length === 0 || isUploading} className="w-full">
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" /> Upload Images
              </>
            )}
          </Button>

          {isUploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Progress: {progress}%</span>
                <span>
                  {results.success} successful, {results.failed} failed
                </span>
              </div>
            </div>
          )}

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
      </div>
    </div>
  )
}

export default BulkImageUpload
