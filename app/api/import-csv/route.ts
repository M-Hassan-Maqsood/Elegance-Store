import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { parse } from "csv-parse/sync"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check if file is CSV
    if (!file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "File must be a CSV" }, { status: 400 })
    }

    // Read file content
    const fileContent = await file.text()

    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    if (!records || records.length === 0) {
      return NextResponse.json({ error: "CSV file is empty" }, { status: 400 })
    }

    // Validate required columns
    const requiredColumns = ["ID", "Product Name", "Product Description", "Price", "Category"]
    const firstRecord = records[0]

    for (const column of requiredColumns) {
      if (!(column in firstRecord)) {
        return NextResponse.json({ error: `Missing required column: ${column}` }, { status: 400 })
      }
    }

    // Process records and prepare for database insertion
    const productsToInsert = records.map((record: any) => {
      // Format the image path correctly
      let imgPath = record["Img Path"] || ""
      if (imgPath.includes("\\")) {
        // Convert Windows-style paths to URL format
        imgPath = imgPath.replace(/\\/g, "/")
      }

      return {
        ID: record.ID,
        "Product Name": record["Product Name"],
        "Product Description": record["Product Description"],
        Price: Number.parseFloat(record.Price) || 0,
        Availability: record.Availability || "In Stock",
        Color: record.Color || "",
        "Img Path": imgPath,
        "Product Link": record["Product Link"] || "",
        Sizes: record.Sizes || "S, M, L",
        Category: record.Category || "Other",
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    })

    // Check for duplicate IDs
    const { data: existingProducts, error: checkError } = await supabase
      .from("products")
      .select("ID")
      .in(
        "ID",
        productsToInsert.map((p) => p.ID),
      )

    if (checkError) {
      console.error("Error checking existing products:", checkError)
      return NextResponse.json({ error: "Failed to check for existing products" }, { status: 500 })
    }

    const existingIds = new Set((existingProducts || []).map((p) => p.ID))

    // Split into products to update and products to insert
    const productsToUpdate = productsToInsert.filter((p) => existingIds.has(p.ID))
    const newProducts = productsToInsert.filter((p) => !existingIds.has(p.ID))

    // Insert new products
    let insertedCount = 0
    if (newProducts.length > 0) {
      const { data: insertedData, error: insertError } = await supabase.from("products").insert(newProducts).select()

      if (insertError) {
        console.error("Error inserting products:", insertError)
        return NextResponse.json({ error: "Failed to insert products" }, { status: 500 })
      }

      insertedCount = insertedData?.length || 0
    }

    // Update existing products
    let updatedCount = 0
    for (const product of productsToUpdate) {
      const { error: updateError } = await supabase
        .from("products")
        .update({
          "Product Name": product["Product Name"],
          "Product Description": product["Product Description"],
          Price: product.Price,
          Availability: product.Availability,
          Color: product.Color,
          "Img Path": product["Img Path"],
          "Product Link": product["Product Link"],
          Sizes: product.Sizes,
          Category: product.Category,
          updated_at: new Date().toISOString(),
        })
        .eq("ID", product.ID)

      if (updateError) {
        console.error(`Error updating product ${product.ID}:`, updateError)
      } else {
        updatedCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${records.length} products`,
      inserted: insertedCount,
      updated: updatedCount,
      total: records.length,
    })
  } catch (error) {
    console.error("Error processing CSV import:", error)
    return NextResponse.json({ error: "Failed to process CSV import" }, { status: 500 })
  }
}
