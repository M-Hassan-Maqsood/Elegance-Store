import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Valid product IDs array is required' },
        { status: 400 }
      );
    }

    // Query products from the database by IDs
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .in('ID', ids)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products by IDs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Sort the products to match the order of the input IDs
    // This ensures products are displayed in order of similarity
    const sortedProducts = [];
    for (const id of ids) {
      const product = products.find(p => p.ID === id);
      if (product) {
        sortedProducts.push(product);
      }
    }

    return NextResponse.json({ products: sortedProducts });
  } catch (error) {
    console.error('Error in products by IDs endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}