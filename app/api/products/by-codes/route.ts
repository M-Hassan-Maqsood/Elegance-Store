import { NextRequest, NextResponse } from 'next/server'
import { getProductsByCode } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const codesParam = searchParams.get('codes')
    
    if (!codesParam) {
      return NextResponse.json({ error: 'No product codes provided' }, { status: 400 })
    }
    
    // Split the comma-separated codes into an array
    const codes = codesParam.split(',').filter(Boolean)
    
    // Get products by code
    const products = await getProductsByCode(codes)
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products by codes:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}