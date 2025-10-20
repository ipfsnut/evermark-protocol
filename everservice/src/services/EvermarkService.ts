import { FarcasterService } from './FarcasterService';
import { IPFSService } from './IPFSService';
import { createEvermark, updateEvermarkProcessingStatus, getOrCreateUser } from '../lib/database';
import type { ContentMetadata, EvermarkCreationRequest, EvermarkCreationResponse } from '../types/evermark';

/**
 * Core Evermark service - orchestrates content processing pipeline
 */
export class EvermarkService {
  /**
   * Main entry point for creating an Evermark
   */
  static async createEvermark(request: EvermarkCreationRequest): Promise<EvermarkCreationResponse> {
    try {
      console.log('🚀 Creating Evermark for:', request);

      // Step 1: Detect content type and extract metadata
      const metadata = await this.extractContentMetadata(request.url);
      if (!metadata) {
        return {
          success: false,
          error: 'Could not extract metadata from the provided URL'
        };
      }

      console.log('✅ Metadata extracted:', metadata);

      // Step 2: Get or create user if userFid provided
      let userId: string | undefined;
      if (request.userFid) {
        try {
          const user = await getOrCreateUser(request.userFid);
          userId = user.id;
          console.log('👤 User found/created:', userId);
        } catch (error) {
          console.warn('⚠️ Could not create user:', error);
        }
      }

      // Step 3: Create initial Evermark record in database
      const evermark = await createEvermark({
        title: metadata.title,
        author: metadata.author,
        description: metadata.description,
        contentType: metadata.contentType,
        sourceUrl: metadata.sourceUrl,
        userId
      });

      console.log('📝 Evermark created in database:', evermark.tokenId);

      // Step 4: Upload metadata to IPFS
      const ipfsResult = await IPFSService.uploadMetadata(metadata);
      
      if (ipfsResult.success && ipfsResult.ipfsHash) {
        console.log('📤 Metadata uploaded to IPFS:', ipfsResult.ipfsHash);
        
        // Update database with IPFS information
        await updateEvermarkProcessingStatus(evermark.tokenId, {
          ipfsMetadataHash: ipfsResult.ipfsHash,
          metadataJson: JSON.stringify(metadata),
          cacheStatus: 'metadata_uploaded',
          imageProcessingStatus: 'completed'
        });
      } else {
        console.warn('⚠️ IPFS upload failed:', ipfsResult.error);
        
        // Still update status to indicate processing attempted
        await updateEvermarkProcessingStatus(evermark.tokenId, {
          cacheStatus: 'ipfs_failed',
          processingErrors: ipfsResult.error || 'IPFS upload failed'
        });
      }

      // Step 5: Return success response
      return {
        success: true,
        tokenId: evermark.tokenId,
        metadata,
        ipfsHash: ipfsResult.ipfsHash,
        // Note: txHash would be added later when blockchain minting is implemented
      };

    } catch (error) {
      console.error('❌ Evermark creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during Evermark creation'
      };
    }
  }

  /**
   * Extract metadata from URL based on content type detection
   */
  private static async extractContentMetadata(url: string): Promise<ContentMetadata | null> {
    try {
      console.log('🔍 Extracting metadata from:', url);

      // Detect content type
      if (FarcasterService.isFarcasterUrl(url)) {
        console.log('🎭 Detected Farcaster cast');
        return await FarcasterService.processCastForEvermark(url);
      }

      // For now, handle other URLs as generic web content
      // TODO: Add TwitterService, DOIService, ISBNService, WebMetadataService
      console.log('🌐 Treating as generic web content');
      return await this.processGenericWebContent(url);

    } catch (error) {
      console.error('Error extracting content metadata:', error);
      return null;
    }
  }

  /**
   * Process generic web content (fallback for non-specialized content)
   */
  private static async processGenericWebContent(url: string): Promise<ContentMetadata> {
    try {
      // Basic URL validation
      const urlObj = new URL(url);
      
      // For now, create basic metadata
      // TODO: Implement web scraping and metadata extraction
      const metadata: ContentMetadata = {
        title: `Web Content from ${urlObj.hostname}`,
        author: 'Unknown',
        description: `Web content from ${url}`,
        contentType: 'URL',
        sourceUrl: url,
        tags: ['web', 'url', urlObj.hostname.replace(/\./g, '-')]
      };

      return metadata;

    } catch (error) {
      console.error('Error processing web content:', error);
      throw new Error('Invalid URL format');
    }
  }

  /**
   * Get Evermark by token ID with full metadata
   */
  static async getEvermark(tokenId: number) {
    // TODO: Implement database query with full metadata
    console.log('📋 Getting Evermark:', tokenId);
    // This will be implemented when we have the full database queries
    return null;
  }

  /**
   * Search Evermarks
   */
  static async searchEvermarks(query: string, limit: number = 20) {
    // TODO: Implement search functionality
    console.log('🔍 Searching Evermarks:', query);
    // This will be implemented when we have the full search system
    return [];
  }

  /**
   * Get recent Evermarks
   */
  static async getRecentEvermarks(limit: number = 20) {
    // TODO: Implement recent Evermarks query
    console.log('📅 Getting recent Evermarks');
    // This will be implemented when we have the full database queries
    return [];
  }

  /**
   * Validate URL format
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Detect content type from URL
   */
  static detectContentType(url: string): 'Cast' | 'Tweet' | 'URL' | 'DOI' | 'ISBN' | 'Custom' {
    if (FarcasterService.isFarcasterUrl(url)) {
      return 'Cast';
    }
    
    // TODO: Add detection for:
    // - Twitter URLs
    // - DOI URLs
    // - ISBN patterns
    
    return 'URL';
  }
}

export default EvermarkService;