import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Initialize Supabase client with service role key for admin access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const productCode = formData.get("productCode") as string
    const imageIndex = (formData.get("imageIndex") as string) || "0"

    if (!file || !productCode) {
      return NextResponse.json({ error: "File and product code are required" }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    const fileExtension = file.name.split(".").pop()
    const fileName = `${productCode}/image_${imageIndex}.${fileExtension}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from("product-images").upload(fileName, buffer, {
      contentType: file.type,
      upsert: true,
    })

    if (error) {
      console.error("Error uploading file:", error)
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(fileName)

    // Update product in database with image URL using the correct column name
    const { error: updateError } = await supabase
      .from("products")
      .update({ "Img Path": publicUrl })
      .eq("ID", productCode)

    if (updateError) {
      console.error("Error updating product:", updateError)
      return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
    }

    return NextResponse.json({
      message: "File uploaded successfully",
      url: publicUrl,
    })
  } catch (error) {
    console.error("Error processing upload:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
