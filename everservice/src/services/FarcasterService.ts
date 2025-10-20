import type { FarcasterCastData, ContentMetadata } from '../types/evermark';

/**
 * FarcasterService - Migrated from evermark-beta
 * Handles Farcaster cast URL validation and metadata extraction
 */
export class FarcasterService {
  /**
   * Validate if input is a Farcaster cast URL or hash
   */
  static validateFarcasterInput(input: string): { 
    isValid: boolean; 
    type: 'url' | 'hash' | null; 
    error?: string 
  } {
    if (!input?.trim()) {
      return { isValid: false, type: null, error: 'Input is required' };
    }

    const trimmedInput = input.trim();

    // Check for Farcaster URLs - be more flexible with hash length
    const urlPatterns = [
      /^https:\/\/warpcast\.com\/[^/]+\/0x[a-fA-F0-9]+/,
      /^https:\/\/farcaster\.xyz\/[^/]+\/0x[a-fA-F0-9]+/,
      /^https:\/\/supercast\.xyz\/[^/]+\/0x[a-fA-F0-9]+/,
      // Also support mobile.farcaster.xyz format
      /^https:\/\/mobile\.farcaster\.xyz\/[^/]+\/0x[a-fA-F0-9]+/
    ];

    for (const pattern of urlPatterns) {
      if (pattern.test(trimmedInput)) {
        return { isValid: true, type: 'url' };
      }
    }

    // Check for direct hash
    if (/^0x[a-fA-F0-9]{8,64}$/.test(trimmedInput)) {
      return { isValid: true, type: 'hash' };
    }

    return { 
      isValid: false, 
      type: null, 
      error: 'Invalid Farcaster cast URL or hash format' 
    };
  }

  /**
   * Extract cast hash from Farcaster URL
   */
  static extractCastHash(input: string): string | null {
    const validation = this.validateFarcasterInput(input);
    if (!validation.isValid) return null;

    if (validation.type === 'hash') {
      return input.trim();
    }

    // Extract full hash from URL - need to get the complete hash, not just the first match
    // Farcaster URLs typically have format: https://farcaster.xyz/username/0x[full-hash]
    const hashMatch = input.match(/0x[a-fA-F0-9]{8,64}/);
    if (hashMatch) {
      console.log('📝 Extracted hash from URL:', hashMatch[0], 'from URL:', input);
      return hashMatch[0];
    }

    console.warn('❌ Could not extract valid hash from URL:', input);
    return null;
  }

  /**
   * Fetch cast metadata using Neynar API
   */
  static async fetchCastMetadata(castInput: string): Promise<FarcasterCastData | null> {
    try {
      console.log('🎭 FarcasterService.fetchCastMetadata called with:', castInput);
      
      const validation = this.validateFarcasterInput(castInput);
      console.log('🔍 Validation result:', validation);
      
      if (!validation.isValid) {
        console.error('❌ Invalid cast hash or URL:', validation.error);
        throw new Error('Invalid cast hash or URL');
      }

      // Extract cast hash if it's a URL
      const castHash = validation.type === 'hash' ? castInput : this.extractCastHash(castInput);
      if (!castHash) {
        throw new Error('Could not extract cast hash from input');
      }

      // Use Neynar API to fetch cast data
      const neynarApiKey = process.env.NEYNAR_API_KEY;
      if (!neynarApiKey) {
        console.warn('⚠️ NEYNAR_API_KEY not found, using fallback data');
        return this.createFallbackCastData(castHash);
      }

      const neynarUrl = `https://api.neynar.com/v2/farcaster/cast?identifier=${castHash}&type=hash`;
      
      console.log('🔗 Neynar API URL:', neynarUrl);

      const response = await fetch(neynarUrl, {
        headers: {
          'Authorization': `Bearer ${neynarApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Neynar API Response status:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('📄 Neynar API Response:', result);
        
        if (result.cast) {
          const cast = result.cast;
          console.log('✅ Cast data found:', cast);
          
          const castData: FarcasterCastData = {
            castHash: cast.hash || castHash,
            author: cast.author?.display_name || cast.author?.username || 'Unknown',
            username: cast.author?.username || '',
            content: cast.text || '',
            timestamp: cast.timestamp || new Date().toISOString(),
            author_pfp: cast.author?.pfp_url,
            author_fid: cast.author?.fid,
            channel: cast.channel?.name,
            engagement: {
              likes: cast.reactions?.likes_count || 0,
              recasts: cast.reactions?.recasts_count || 0,
              replies: cast.replies?.count || 0
            },
            embeds: cast.embeds?.map((embed: any) => ({
              url: embed.url,
              cast_id: embed.cast_id,
              metadata: embed.metadata
            }))
          };
          
          console.log('📋 Formatted cast data:', castData);
          return castData;
        } else {
          console.log('❌ Neynar response missing cast data:', result);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Neynar API Error response:', errorText);
      }

      // Fallback: Create basic metadata
      console.warn('Could not fetch cast metadata from Neynar, using fallback');
      return this.createFallbackCastData(castHash);
      
    } catch (error) {
      console.error('Failed to fetch Farcaster cast metadata:', error);
      return null;
    }
  }

  /**
   * Create fallback cast data when API fails
   */
  private static createFallbackCastData(castHash: string): FarcasterCastData {
    return {
      castHash,
      author: 'Farcaster User',
      username: '',
      content: 'Cast content will be displayed when available',
      timestamp: new Date().toISOString(),
      engagement: {
        likes: 0,
        recasts: 0,
        replies: 0
      }
    };
  }

  /**
   * Process Farcaster cast and create metadata for Evermark
   */
  static async processCastForEvermark(castInput: string): Promise<ContentMetadata | null> {
    try {
      const castData = await this.fetchCastMetadata(castInput);
      if (!castData) {
        throw new Error('Failed to fetch cast metadata');
      }

      // Create metadata for Evermark
      const metadata: ContentMetadata = {
        title: this.generateCastTitle(castData),
        author: castData.author || 'Unknown Farcaster User',
        description: this.generateCastDescription(castData),
        contentType: 'Cast',
        sourceUrl: castInput,
        tags: this.generateCastTags(castData),
        extendedMetadata: {
          castData
        }
      };

      return metadata;
    } catch (error) {
      console.error('Error processing cast for Evermark:', error);
      return null;
    }
  }

  /**
   * Generate a meaningful title for the cast
   */
  private static generateCastTitle(castData: FarcasterCastData): string {
    const author = castData.author || 'Unknown';
    const content = castData.content || '';
    
    // Use first 50 characters of content as title, or default format
    if (content.length > 0) {
      const shortContent = content.length > 50 ? content.substring(0, 47) + '...' : content;
      return `Cast by ${author}: ${shortContent}`;
    }
    
    return `Cast by ${author}`;
  }

  /**
   * Generate description with engagement stats
   */
  private static generateCastDescription(castData: FarcasterCastData): string {
    const content = castData.content || 'Farcaster cast content';
    const engagement = castData.engagement;
    const timestamp = castData.timestamp ? new Date(castData.timestamp).toLocaleDateString() : 'Unknown date';
    
    let description = `${content}\n\n`;
    description += `Posted on ${timestamp}`;
    
    if (engagement) {
      description += `\n👍 ${engagement.likes} likes • 🔄 ${engagement.recasts} recasts • 💬 ${engagement.replies} replies`;
    }
    
    if (castData.channel) {
      description += `\n📺 Channel: ${castData.channel}`;
    }
    
    return description;
  }

  /**
   * Generate relevant tags for the cast
   */
  private static generateCastTags(castData: FarcasterCastData): string[] {
    const tags = ['farcaster', 'cast'];
    
    if (castData.channel) {
      tags.push(`channel-${castData.channel}`);
    }
    
    if (castData.username) {
      tags.push(`author-${castData.username}`);
    }
    
    // Add engagement-based tags
    if (castData.engagement) {
      if (castData.engagement.likes > 10) {
        tags.push('popular');
      }
      if (castData.engagement.recasts > 5) {
        tags.push('viral');
      }
    }
    
    return tags;
  }

  /**
   * Check if the input is a Farcaster cast URL
   */
  static isFarcasterUrl(url: string): boolean {
    const validation = this.validateFarcasterInput(url);
    return validation.isValid && validation.type === 'url';
  }
}

export default FarcasterService;