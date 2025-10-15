import { NextRequest, NextResponse } from 'next/server';
import { MetadataKit } from '@evermark/metadata-kit';

// Initialize metadata kit
const metadataKit = new MetadataKit();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Extract metadata using the SDK
    const metadata = await metadataKit.extractMetadata(url);
    
    return NextResponse.json({
      success: true,
      metadata,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Evermarks API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process evermark',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, title, description } = body;
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Process evermark creation
    const metadata = await metadataKit.extractMetadata(url);
    
    // TODO: Save to database
    // TODO: Upload to storage (ArDrive/IPFS)
    // TODO: Mint NFT
    
    // Extract title safely from different metadata types
    const extractedTitle = 'text' in metadata ? metadata.text : 
                          'title' in metadata ? metadata.title : 
                          'Unknown Title';
    
    const extractedDescription = 'description' in metadata ? metadata.description :
                                'text' in metadata ? metadata.text :
                                'No description available';

    return NextResponse.json({
      success: true,
      evermark: {
        url,
        title: title || extractedTitle,
        description: description || extractedDescription,
        metadata,
        createdAt: new Date().toISOString()
      }
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