import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const maxDuration = 10 // Reduced from default to comply with hobby plan limits

export async function GET() {
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

    // Check if the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("Error listing buckets:", listError)
      return NextResponse.json({ success: false, error: listError.message }, { status: 500 })
    }

    const bucketExists = buckets.some((bucket) => bucket.name === "product-images")

    // If bucket doesn't exist, create it
    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket("product-images", {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      })

      if (createError) {
        console.error("Error creating bucket:", createError)
        return NextResponse.json({ success: false, error: createError.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, created: true })
    }

    return NextResponse.json({ success: true, exists: true })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
