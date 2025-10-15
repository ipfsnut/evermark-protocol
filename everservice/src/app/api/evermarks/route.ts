import { NextRequest, NextResponse } from 'next/server';
import { AccurateArDrivePricing } from '@ipfsnut/evermark-metadata-kit';

// Simple in-memory storage for development (replace with database in production)
const mockEvermarks: any[] = [];

/**
 * GET /api/evermarks - List evermarks or get metadata for a URL
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;
    
    // If URL provided, extract metadata (simplified for now)
    if (url) {
      // TODO: Use MetadataKit when properly configured
      const metadata = {
        title: 'Sample Title',
        description: 'Sample description from URL',
        url,
        type: 'web-content'
      };
      
      return NextResponse.json({
        success: true,
        metadata,
        timestamp: new Date().toISOString()
      });
    }

    // List existing evermarks from mock storage
    const total = mockEvermarks.length;
    const paginatedEvermarks = mockEvermarks
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(offset, offset + limit);
    
    return NextResponse.json({
      success: true,
      evermarks: paginatedEvermarks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Evermarks API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/evermarks - Create a new Evermark
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Step 1: Extract metadata using MetadataKit
    console.log('🔍 Extracting metadata for:', url);
    
    const metadata = {
      title: `Content from ${new URL(url).hostname}`,
      description: `Content preserved from ${url}`,
      url,
      type: 'web-content',
      extractedAt: new Date().toISOString()
    };
    
    // Step 2: Check for duplicates in mock storage
    const existingEvermark = mockEvermarks.find(em => em.source_url === url);
    if (existingEvermark) {
      return NextResponse.json({
        error: 'Duplicate content',
        message: `This content has already been Evermarked as Token ID ${existingEvermark.token_id}`,
        existingTokenId: existingEvermark.token_id
      }, { status: 409 });
    }

    // Step 3: Extract title and description safely
    const extractedTitle = metadata.title || 'Evermark';
    const extractedDescription = metadata.description || 'Content preserved via Evermark Protocol';

    // Step 4: Generate a mock token ID (in production, this would come from blockchain)
    const mockTokenId = Math.floor(Math.random() * 1000000) + 1000;

    // Step 5: Prepare Evermark data
    const evermarkData = {
      token_id: mockTokenId,
      title: extractedTitle,
      author: 'Farcaster User', // This would come from Farcaster context
      owner: '0x0000000000000000000000000000000000000000', // Mock address
      description: extractedDescription,
      content_type: 'Web Content',
      source_url: url,
      token_uri: `https://evermark.epicdylan.com/evermarks/${mockTokenId}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata_fetched: true,
      verified: false,
      metadata_json: JSON.stringify({
        title: extractedTitle,
        description: extractedDescription,
        url,
        timestamp: new Date().toISOString(),
        metadata
      }),
      view_count: 0
    };

    // Step 6: Save to mock storage (replace with database in production)
    mockEvermarks.push(evermarkData);
    console.log('✅ Evermark created in mock storage:', evermarkData.token_id);

    // Step 7: Calculate storage cost using MetadataKit
    try {
      const contentSize = JSON.stringify(metadata).length;
      const storageCost = await AccurateArDrivePricing.calculateCost(contentSize);
      console.log('💰 Estimated storage cost:', storageCost);
    } catch (error) {
      console.log('⚠️ Could not calculate storage cost:', error);
    }

    return NextResponse.json({
      success: true,
      tokenId: evermarkData.token_id,
      evermark: {
        id: evermarkData.token_id.toString(),
        tokenId: evermarkData.token_id,
        title: evermarkData.title,
        description: evermarkData.description,
        url: evermarkData.source_url,
        createdAt: evermarkData.created_at,
        metadata
      },
      message: 'Evermark created successfully! In production, this would be minted as an NFT on Base blockchain.'
    });

  } catch (error) {
    console.error('Evermark creation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create evermark',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}