import { NextRequest, NextResponse } from 'next/server';
import { EvermarkService } from '../../../services/EvermarkService';
import { getRecentEvermarks } from '../../../lib/database';
import type { EvermarkCreationRequest } from '../../../types/evermark';

/**
 * GET /api/evermarks - List recent evermarks
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    
    console.log('📋 Fetching recent Evermarks:', { page, limit });

    // Get recent evermarks from database
    const evermarks = await getRecentEvermarks(limit);
    
    // Transform database records to API format
    const transformedEvermarks = evermarks.map(evermark => ({
      id: evermark.tokenId.toString(),
      tokenId: evermark.tokenId,
      title: evermark.title,
      author: evermark.author || 'Unknown',
      description: evermark.description || '',
      contentType: evermark.contentType || 'URL',
      sourceUrl: evermark.sourceUrl,
      createdAt: evermark.createdAt.toISOString(),
      updatedAt: evermark.updatedAt.toISOString(),
      verified: evermark.verified,
      user: evermark.user ? {
        username: evermark.user.username,
        displayName: evermark.user.displayName,
        pfpUrl: evermark.user.pfpUrl
      } : null,
      voteCount: evermark.votes?.reduce((sum, vote) => sum + vote.weight, 0) || 0,
      // IPFS and processing info
      ipfsHash: evermark.ipfsMetadataHash,
      imageUrl: evermark.supabaseImageUrl || evermark.thumbnailUrl,
      processingStatus: evermark.imageProcessingStatus || 'pending'
    }));
    
    return NextResponse.json({
      success: true,
      evermarks: transformedEvermarks,
      pagination: {
        page,
        limit,
        total: transformedEvermarks.length, // TODO: Get actual total from database
        totalPages: Math.ceil(transformedEvermarks.length / limit),
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ GET Evermarks API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch evermarks',
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
    const { url, userFid } = body;
    
    console.log('🚀 Creating Evermark for URL:', url, 'userFid:', userFid);
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    if (!EvermarkService.isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Create Evermark creation request
    const createRequest: EvermarkCreationRequest = {
      url: url.trim(),
      userFid: userFid || undefined
    };

    // Use EvermarkService to handle the entire creation pipeline
    const result = await EvermarkService.createEvermark(createRequest);
    
    if (result.success) {
      console.log('✅ Evermark created successfully:', result.tokenId);
      
      return NextResponse.json({
        success: true,
        tokenId: result.tokenId,
        metadata: result.metadata,
        ipfsHash: result.ipfsHash,
        txHash: result.txHash,
        evermark: {
          id: result.tokenId?.toString(),
          tokenId: result.tokenId,
          title: result.metadata?.title,
          description: result.metadata?.description,
          contentType: result.metadata?.contentType,
          url: result.metadata?.sourceUrl,
          createdAt: new Date().toISOString(),
          ipfsHash: result.ipfsHash,
          processing: true // Indicates background processing may still be occurring
        },
        message: 'Evermark created successfully! Content has been processed and stored on IPFS.'
      });
    } else {
      console.error('❌ Evermark creation failed:', result.error);
      
      return NextResponse.json(
        { 
          error: 'Failed to create evermark',
          message: result.error || 'Unknown error during creation'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ POST Evermarks API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create evermark',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}