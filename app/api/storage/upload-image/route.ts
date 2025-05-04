import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

export const maxDuration = 60 // Changed from 300 to 60 seconds (maximum allowed on hobby plan)

export async function POST(request: NextRequest) {
  try {
    // Create a Supabase client with the service role key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseServiceKey) {
      return NextResponse.json(
        { success: false, error: "Server configuration error: Missing service role key" },
        { status: 500 },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get form data with the file
    const formData = await request.formData()
    const file = formData.get("file") as File
    const productId = formData.get("productId") as string
    const imageName = formData.get("imageName") as string

    if (!file || !productId || !imageName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: file, productId, or imageName" },
        { status: 400 },
      )
    }

    // Check if the file already exists in storage
    const filePath = `${productId}/${imageName}`
    const { data: existingFile } = await supabase.storage.from("product-images").list(productId, {
      limit: 100,
      search: imageName,
    })

    // If the file exists and has the same name, we'll consider it as already uploaded
    if (existingFile && existingFile.length > 0) {
      // Find the exact file match
      const exactMatch = existingFile.find(item => item.name === imageName)
      if (exactMatch) {
        // File already exists, return success with a note
        const imageUrl = supabase.storage.from("product-images").getPublicUrl(filePath).data.publicUrl
        return NextResponse.json({
          success: true,
          path: filePath,
          alreadyExists: true,
          message: "File already exists",
          url: imageUrl
        })
      }
    }

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage.from("product-images").upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error("Error uploading file:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // If this is image_0, update the product's image_url in the database
    if (imageName === "image_0.jpg" || imageName === "image_0.jpeg" || imageName === "image_0.png") {
      const imageUrl = supabase.storage.from("product-images").getPublicUrl(filePath).data.publicUrl

      const { error: updateError } = await supabase
        .from("products")
        .update({ "Img Path": imageUrl })
        .eq("ID", productId)

      if (updateError) {
        console.error(`Error updating product ${productId}:`, updateError)
        // We don't fail the whole request if just the DB update fails
      }
    }

    return NextResponse.json({
      success: true,
      path: data?.path || filePath,
      alreadyExists: false,
    })
  } catch (error) {
    console.error("Server error during upload:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
