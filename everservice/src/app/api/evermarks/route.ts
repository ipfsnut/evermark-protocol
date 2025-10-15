import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// TODO: Import MetadataKit when it's properly configured
// import { MetadataKit } from '@evermark/metadata-kit';
// const metadataKit = new MetadataKit();

// Initialize PostgreSQL connection pool for Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Table name for evermarks
const EVERMARKS_TABLE = 'evermarks';

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

    // List existing evermarks from Railway PostgreSQL
    const client = await pool.connect();
    
    try {
      // Get total count for pagination
      const countResult = await client.query(`SELECT COUNT(*) FROM ${EVERMARKS_TABLE}`);
      const total = parseInt(countResult.rows[0].count);
      
      // Get paginated evermarks
      const evermarksResult = await client.query(
        `SELECT * FROM ${EVERMARKS_TABLE} 
         ORDER BY created_at DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      
      return NextResponse.json({
        success: true,
        evermarks: evermarksResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
      
    } finally {
      client.release();
    }

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

    // Step 1: Extract metadata (simplified for now)
    console.log('🔍 Extracting metadata for:', url);
    // TODO: Use MetadataKit when properly configured
    const metadata = {
      title: `Content from ${new URL(url).hostname}`,
      description: `Content preserved from ${url}`,
      url,
      type: 'web-content',
      extractedAt: new Date().toISOString()
    };
    
    // Step 2: Check for duplicates in Railway PostgreSQL
    const client = await pool.connect();
    
    try {
      const duplicateResult = await client.query(
        `SELECT token_id, title FROM ${EVERMARKS_TABLE} WHERE source_url = $1 LIMIT 1`,
        [url]
      );
      
      if (duplicateResult.rows.length > 0) {
        const existing = duplicateResult.rows[0];
        return NextResponse.json({
          error: 'Duplicate content',
          message: `This content has already been Evermarked as Token ID ${existing.token_id}`,
          existingTokenId: existing.token_id
        }, { status: 409 });
      }
    } finally {
      client.release();
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

    // Step 6: Save to Railway PostgreSQL database
    const saveClient = await pool.connect();
    
    try {
      const insertResult = await saveClient.query(
        `INSERT INTO ${EVERMARKS_TABLE} 
         (token_id, title, author, owner, description, content_type, source_url, token_uri, metadata_json, view_count, created_at, updated_at, verified, metadata_fetched)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING *`,
        [
          evermarkData.token_id,
          evermarkData.title,
          evermarkData.author,
          evermarkData.owner,
          evermarkData.description,
          evermarkData.content_type,
          evermarkData.source_url,
          evermarkData.token_uri,
          evermarkData.metadata_json,
          evermarkData.view_count,
          evermarkData.created_at,
          evermarkData.updated_at,
          evermarkData.verified,
          evermarkData.metadata_fetched
        ]
      );
      
      const createdEvermark = insertResult.rows[0];
      console.log('✅ Evermark created in PostgreSQL:', createdEvermark.token_id);

      return NextResponse.json({
        success: true,
        tokenId: createdEvermark.token_id,
        evermark: {
          id: createdEvermark.token_id.toString(),
          tokenId: createdEvermark.token_id,
          title: createdEvermark.title,
          description: createdEvermark.description,
          url: createdEvermark.source_url,
          createdAt: createdEvermark.created_at,
          metadata
        },
        message: 'Evermark created successfully! In production, this would be minted as an NFT on Base blockchain.'
      });
      
    } finally {
      saveClient.release();
    }

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