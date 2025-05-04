"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FolderOpen, Loader2, Check, AlertCircle, RefreshCw } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client for the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function FolderStructureUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<{ success: number; skipped: number; failed: number }>({ 
    success: 0, 
    skipped: 0, 
    failed: 0 
  })
  const [uploadStatus, setUploadStatus] = useState<{ success: boolean; message: string } | null>(null)
  const [selectedFolders, setSelectedFolders] = useState<{ [key: string]: FileList }>({})
  const folderInputRef = useRef<HTMLInputElement>(null)
  const [bucketStatus, setBucketStatus] = useState<"checking" | "missing" | "ready" | "error">("checking")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const checkBucket = async () => {
    try {
      setIsRefreshing(true)
      setBucketStatus("checking")
      setUploadStatus(null)
      setErrorMessage(null)

      console.log("Checking bucket via API...")

      // Use our server API to check/create bucket instead of direct Supabase client
      const response = await fetch("/api/storage/check-bucket")
      const data = await response.json()

      console.log("API response:", data)

      if (!response.ok || !data.success) {
        console.error("Error checking/creating bucket:", data.error)
        setBucketStatus("error")
        setErrorMessage(data.error || "Failed to check storage bucket")
        return
      }

      // Fix: Check for data.exists instead of data.bucketExists
      if (data.exists || data.created) {
        console.log("Bucket exists and is ready")
        setBucketStatus("ready")
      } else {
        console.log("Bucket does not exist")
        setBucketStatus("missing")
      }
    } catch (error) {
      console.error("Error checking bucket:", error)
      setBucketStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    checkBucket()
  }, [])

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const files = e.target.files
    const folderMap: { [key: string]: FileList } = {}

    // Group files by their product ID folder
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const path = file.webkitRelativePath || file.name
      const pathParts = path.split("/")

      // Skip if not in the expected format: images/productId/image_x.jpg
      if (pathParts.length < 3 || pathParts[0] !== "images") continue

      const productId = pathParts[1]

      if (!folderMap[productId]) {
        // Create a new FileList-like object for this product ID
        folderMap[productId] = Object.create(FileList.prototype)
        Object.defineProperty(folderMap[productId], "length", { value: 0, writable: true })
      }

      // Add file to the product's FileList
      const currentLength = folderMap[productId].length || 0
      Object.defineProperty(folderMap[productId], currentLength.toString(), { value: file, enumerable: true })
      Object.defineProperty(folderMap[productId], "length", { value: currentLength + 1, writable: true })
    }

    setSelectedFolders(folderMap)
    setUploadStatus(null)
  }

  const uploadFileViaAPI = async (file: File, productId: string, imageName: string) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("productId", productId)
    formData.append("imageName", imageName)

    const response = await fetch("/api/storage/upload-image", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to upload file")
    }

    return await response.json()
  }

  const handleUpload = async () => {
    if (Object.keys(selectedFolders).length === 0) return
    if (bucketStatus !== "ready") {
      setUploadStatus({
        success: false,
        message: "Cannot upload files: Storage bucket 'product-images' is not available",
      })
      return
    }

    setIsUploading(true)
    setProgress(0)
    setResults({ success: 0, skipped: 0, failed: 0 })
    setUploadStatus(null)

    try {
      const productIds = Object.keys(selectedFolders)
      let totalSuccess = 0
      let totalSkipped = 0
      let totalFailed = 0
      let totalFiles = 0

      // Count total files
      for (const productId of productIds) {
        totalFiles += selectedFolders[productId].length
      }

      let processedFiles = 0

      // Process each product folder
      for (const productId of productIds) {
        const files = selectedFolders[productId]

        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const path = file.webkitRelativePath || file.name
          const pathParts = path.split("/")

          // Get the image filename (e.g., image_0.jpg)
          const imageName = pathParts[pathParts.length - 1]

          try {
            // Upload via our server API instead of direct Supabase client
            const result = await uploadFileViaAPI(file, productId, imageName)

            if (result.success) {
              if (result.alreadyExists) {
                totalSkipped++
                console.log(`Skipped ${path}: File already exists`)
              } else {
                totalSuccess++
              }
            } else {
              console.error(`Error uploading ${path}:`, result.error)
              totalFailed++
            }
          } catch (error) {
            console.error(`Error processing ${path}:`, error)
            totalFailed++
          }

          // Update progress
          processedFiles++
          const currentProgress = Math.round((processedFiles / totalFiles) * 100)
          setProgress(currentProgress)
          setResults({ success: totalSuccess, skipped: totalSkipped, failed: totalFailed })
        }
      }

      setUploadStatus({
        success: totalFailed === 0,
        message: `Upload complete: ${totalSuccess} uploaded, ${totalSkipped} already existed, ${totalFailed} failed`,
      })
    } catch (error) {
      console.error("Upload process error:", error)
      setUploadStatus({
        success: false,
        message: `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Upload Product Image Folders</h2>

        <p className="text-gray-600 mb-6">
          Upload your entire product image folder structure. Select the "images" folder that contains all your product
          subfolders. The system will automatically detect which images are new and which already exist.
        </p>

        <div className="space-y-6">
          {bucketStatus === "missing" && (
            <Alert className="bg-amber-50 border-amber-200">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="font-medium">
                    Storage bucket "product-images" is being created automatically
                  </AlertDescription>
                </div>
                <div className="pl-6 text-sm">
                  <p className="mb-2">Click the "Check Again" button below to check if the bucket is ready:</p>
                  <div className="mt-3 flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={checkBucket}
                      disabled={isRefreshing}
                      className="text-xs"
                    >
                      {isRefreshing ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Checking...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-1 h-3 w-3" /> Check Again
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Alert>
          )}

          {bucketStatus === "checking" && (
            <Alert className="bg-blue-50">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <AlertDescription>Setting up storage bucket...</AlertDescription>
              </div>
            </Alert>
          )}

          {bucketStatus === "error" && (
            <Alert className="bg-red-50">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription>Failed to check storage setup.</AlertDescription>
                </div>
                {errorMessage && <div className="pl-6 text-sm text-red-600">Error: {errorMessage}</div>}
                <div className="pl-6 flex gap-2">
                  <Button variant="outline" size="sm" onClick={checkBucket} disabled={isRefreshing} className="text-xs">
                    {isRefreshing ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Checking...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-1 h-3 w-3" /> Try Again
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Alert>
          )}

          {bucketStatus === "ready" && (
            <Alert className="bg-green-50">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription>Storage bucket "product-images" is ready for uploads</AlertDescription>
              </div>
            </Alert>
          )}

          <div>
            <Button
              onClick={() => folderInputRef.current?.click()}
              disabled={isUploading || bucketStatus !== "ready"}
              className="w-full"
            >
              <FolderOpen className="mr-2 h-4 w-4" /> Select Images Folder
            </Button>
            <input
              type="file"
              ref={folderInputRef}
              onChange={handleFolderSelect}
              webkitdirectory="true"
              directory="true"
              multiple
              className="hidden"
              disabled={isUploading || bucketStatus !== "ready"}
            />

            {Object.keys(selectedFolders).length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p className="font-medium">Selected folder structure:</p>
                <p className="text-sm text-gray-600">
                  {Object.keys(selectedFolders).length} product folders containing{" "}
                  {Object.values(selectedFolders).reduce((acc, files) => acc + files.length, 0)} images
                </p>
                <div className="mt-2 max-h-40 overflow-y-auto">
                  <ul className="text-xs text-gray-500">
                    {Object.keys(selectedFolders)
                      .slice(0, 10)
                      .map((productId) => (
                        <li key={productId}>
                          {productId}: {selectedFolders[productId].length} images
                        </li>
                      ))}
                    {Object.keys(selectedFolders).length > 10 && (
                      <li>...and {Object.keys(selectedFolders).length - 10} more</li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={Object.keys(selectedFolders).length === 0 || isUploading || bucketStatus !== "ready"}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
              </>
            ) : (
              <>Upload All Product Images</>
            )}
          </Button>

          {isUploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Progress: {progress}%</span>
                <span>
                  {results.success} uploaded, {results.skipped} skipped, {results.failed} failed
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
