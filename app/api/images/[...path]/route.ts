import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

export const maxDuration = 10 // Set a reasonable timeout for image serving

// This config is needed to ensure images are cached properly
export const dynamic = "force-dynamic"
export const revalidate = 3600 // Cache for 1 hour

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    // Get the path parameters
    const path = params.path || []

    if (path.length < 2) {
      return new NextResponse("Invalid image path", { status: 400 })
    }

    // Extract productId and imageName from the path
    const productId = path[0]
    const imageName = path.slice(1).join("/")
    const fullPath = `${productId}/${imageName}`

    // Create Supabase client with service role key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseServiceKey) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY")
      return new NextResponse("Server configuration error", { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the file from Supabase Storage
    const { data, error } = await supabase.storage.from("product-images").download(fullPath)

    if (error || !data) {
      console.error(`Error fetching image ${fullPath}:`, error)
      // Return a 404 response
      return new NextResponse("Image not found", { status: 404 })
    }

    // Determine content type based on file extension
    const fileExtension = imageName.split(".").pop()?.toLowerCase() || ""
    let contentType = "application/octet-stream"

    if (fileExtension === "jpg" || fileExtension === "jpeg") {
      contentType = "image/jpeg"
    } else if (fileExtension === "png") {
      contentType = "image/png"
    } else if (fileExtension === "gif") {
      contentType = "image/gif"
    } else if (fileExtension === "webp") {
      contentType = "image/webp"
    }

    // Convert the blob to an array buffer
    const arrayBuffer = await data.arrayBuffer()

    // Return the image with appropriate headers
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Error serving image:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
