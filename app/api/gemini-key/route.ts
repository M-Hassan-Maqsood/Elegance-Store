import { NextResponse } from 'next/server';

export async function GET() {
  // Return the API key from environment variables
  return NextResponse.json({ 
    key: process.env.GEMINI_API_KEY 
  });
}