import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Everservice is running!',
    timestamp: new Date().toISOString(),
    environment: {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_KEY,
      supabaseUrlPrefix: process.env.SUPABASE_URL?.substring(0, 20) + '...'
    }
  });
}