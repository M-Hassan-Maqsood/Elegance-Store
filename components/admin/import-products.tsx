"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface ImportProductsProps {
  onImportComplete: () => Promise<void>
}

export default function ImportProducts({ onImportComplete }: ImportProductsProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/import", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
        })
        await onImportComplete()
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to import products",
        })
      }
    } catch (error) {
      console.error("Error importing products:", error)
      setResult({
        success: false,
        message: "An unexpected error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Import Products from CSV</h2>

        <p className="text-gray-600 mb-6">
          Upload a CSV file with product data. The file should have the following columns: ID, Product Name, Product
          Description, Price, Availability, Color, Img Path, Product Link
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="csv-file" className="block text-sm font-medium text-gray-700 mb-1">
              CSV File
            </label>
            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} required />
          </div>

          <Button type="submit" disabled={!file || loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...
              </>
            ) : (
              "Import Products"
            )}
          </Button>
        </form>

        {result && (
          <Alert className={`mt-6 ${result.success ? "bg-green-50" : "bg-red-50"}`}>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}

        <div className="mt-8">
          <h3 className="font-medium mb-2">CSV Format Example:</h3>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
            ID,Product Name,Product Description,Price,Availability,Color,Img Path,Product Link
            <br />
            ALK231009,Fabrics 3 Piece Suit,Printed Light Khaddar | Top Bottoms Dupatta,3490,In
            Stock,NAVY,images\ALK231009,https://pk.khaadi.com/fabrics-3-piece-suit-alk231009-1001785332.html
            <br />
            BLK231004,Fabrics 3 Piece Suit,Printed Embroidered Light Khaddar | Top Bottoms Dupatta,4290,In
            Stock,OLIVE,images\BLK231004,https://pk.khaadi.com/fabrics-3-piece-suit-blk231004-1001786404.html
          </pre>
        </div>
      </div>
    </div>
  )
}
