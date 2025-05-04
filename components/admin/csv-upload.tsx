"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, FileText, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CSVUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is a CSV
    if (!file.name.endsWith(".csv")) {
      setError("Please select a CSV file")
      return
    }

    setSelectedFile(file)
    setError(null)
    setUploadResult(null)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    // Check if file is a CSV
    if (!file.name.endsWith(".csv")) {
      setError("Please select a CSV file")
      return
    }

    setSelectedFile(file)
    setError(null)
    setUploadResult(null)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setError(null)
    setUploadResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setIsUploading(true)
      setError(null)
      setUploadResult(null)

      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/import-csv", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload CSV")
      }

      setUploadResult(data)
      handleRemoveFile() // Clear the file after successful upload
    } catch (error) {
      console.error("Error uploading CSV:", error)
      setError(error instanceof Error ? error.message : "Failed to upload CSV")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          selectedFile ? "border-gray-300" : "border-gray-400"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {selectedFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-gray-400 mr-3" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <button onClick={handleRemoveFile} className="text-red-500 hover:text-red-700" aria-label="Remove file">
              <X size={20} />
            </button>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-8 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">Drag and drop a CSV file here, or click to select a file</p>
            <p className="mt-1 text-xs text-gray-400">CSV file only</p>
          </div>
        )}

        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {uploadResult && (
        <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md flex items-start">
          <Check className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{uploadResult.message}</p>
            <ul className="mt-2 text-sm">
              <li>New products added: {uploadResult.inserted}</li>
              <li>Existing products updated: {uploadResult.updated}</li>
              <li>Total products processed: {uploadResult.total}</li>
            </ul>
          </div>
        </div>
      )}

      <div className="mt-4">
        <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full">
          {isUploading ? "Uploading..." : "Upload CSV"}
        </Button>
      </div>
    </div>
  )
}
