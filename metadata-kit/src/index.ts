// Evermark Metadata Kit - Content Extraction and Processing SDK

// Core Services (re-export static classes)
export * as DOIService from './services/DOIService.js';
export * as ISBNService from './services/ISBNService.js';
export * as WebMetadataService from './services/WebMetadataService.js';
export * as FarcasterService from './services/FarcasterService.js';
export * as TwitterService from './services/TwitterService.js';
export * as AccurateArDrivePricing from './services/AccurateArDrivePricing.js';

// Types
export * from './types/index.js';

// Import for internal use
import * as DOIService from './services/DOIService.js';
import * as ISBNService from './services/ISBNService.js';
import * as WebMetadataService from './services/WebMetadataService.js';
import * as FarcasterService from './services/FarcasterService.js';
import * as TwitterService from './services/TwitterService.js';
import * as AccurateArDrivePricing from './services/AccurateArDrivePricing.js';

/**
 * Main MetadataKit class for coordinated content processing
 */
export class MetadataKit {

  /**
   * Extract metadata from any URL
   */
  async extractMetadata(url: string) {
    try {
      // Determine content type and route to appropriate service
      if (url.includes('doi.org') || url.includes('dx.doi.org')) {
        return await DOIService.extractDOIMetadata(url);
      }
      
      if (url.includes('farcaster.xyz') || url.includes('warpcast.com')) {
        return await FarcasterService.extractCastMetadata(url);
      }
      
      if (url.includes('twitter.com') || url.includes('x.com')) {
        return await TwitterService.extractTweetMetadata(url);
      }
      
      // Default to web metadata extraction
      return await WebMetadataService.extractWebMetadata(url);
    } catch (error) {
      console.error('MetadataKit extraction failed:', error);
      throw error;
    }
  }

  /**
   * Calculate ArDrive storage cost
   */
  async calculateStorageCost(sizeBytes: number) {
    return await AccurateArDrivePricing.calculateCost(sizeBytes);
  }

  /**
   * Detect ISBN from text or URL
   */
  async extractISBN(input: string) {
    return await ISBNService.extractISBN(input);
  }
}