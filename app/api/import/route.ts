import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { parse } from "csv-parse/sync"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "CSV file is required" }, { status: 400 })
    }

    // Convert file to text
    const text = await file.text()

    // Parse CSV
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    // Process each record
    const results = []
    for (const record of records) {
      // Map CSV columns to database columns - using the exact column names from the database
      const product = {
        ID: record.ID || record.Code,
        "Product Name": record["Product Name"] || record.Name,
        "Product Description": record["Product Description"] || record.Description,
        Price: Number.parseFloat(record.Price),
        Availability: record.Availability || "In Stock",
        Color: record.Color,
        Category: determineCategory(record["Product Name"] || record.Name),
        Sizes: record.Size || "S, M, L", // Use Size column if available, otherwise default
        "Img Path": record["Img Path"] || null,
        "Product Link": record["Product Link"],
        featured: false,
      }

      // Insert into database
      const { data, error } = await supabase
        .from("products")
        .upsert(product, {
          onConflict: "ID", // Using ID as the conflict column
          ignoreDuplicates: false,
        })
        .select()

      if (error) {
        console.error("Error inserting product:", error)
        results.push({
          code: product.ID,
          status: "error",
          message: error.message,
        })
      } else {
        results.push({
          code: product.ID,
          status: "success",
          data,
        })
      }
    }

    return NextResponse.json({
      message: `Imported ${results.filter((r) => r.status === "success").length} products`,
      results,
    })
  } catch (error) {
    console.error("Error processing CSV import:", error)
    return NextResponse.json({ error: "Failed to process CSV file" }, { status: 500 })
  }
}

// Helper function to determine category from product name
function determineCategory(name: string): string {
  if (!name) return "Other"

  const lowerName = name.toLowerCase()
  if (lowerName.includes("3 piece")) return "3 Piece"
  if (lowerName.includes("3-piece")) return "3 Piece"
  if (lowerName.includes("2 piece")) return "2 Piece"
  if (lowerName.includes("2-piece")) return "2 Piece"
  if (lowerName.includes("print")) return "Printed"

  return "Other"
}
