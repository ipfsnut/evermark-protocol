import { MetadataKit } from '@evermark/metadata-kit';

export interface SavedContent {
  id: string;
  url: string;
  title: string;
  description: string;
  metadata: any;
  userFid: number;
  tags: string[];
  createdAt: string;
  storageUrls: {
    arweave?: string;
    ipfs?: string;
  };
  nftTokenId?: string;
}

export interface SearchResult {
  content: SavedContent;
  relevanceScore: number;
  excerpt: string;
}

export class BotContentService {
  private metadataKit: MetadataKit;

  constructor() {
    this.metadataKit = new MetadataKit();
  }

  async saveContent(url: string, userFid: number, additionalData?: {
    title?: string;
    description?: string;
    tags?: string[];
    originalCast?: any;
  }): Promise<SavedContent> {
    try {
      console.log(`Saving content for user ${userFid}: ${url}`);

      // Extract metadata
      const metadata = await this.metadataKit.extractMetadata(url);
      
      // Prepare content data
      const contentData = {
        url,
        userFid,
        title: additionalData?.title || this.extractTitle(metadata),
        description: additionalData?.description || this.extractDescription(metadata),
        metadata,
        tags: additionalData?.tags || this.extractTags(metadata),
        originalCast: additionalData?.originalCast,
        createdAt: new Date().toISOString()
      };

      // Call storage API to upload content
      const storageResult = await this.uploadToStorage(contentData);
      
      // Save to database
      const savedContent = await this.saveToDatabase({
        ...contentData,
        storageUrls: storageResult.urls,
        id: this.generateContentId()
      });

      // Mint NFT (async, don't wait)
      this.mintNFT(savedContent).catch(error => 
        console.error('NFT minting failed:', error)
      );

      return savedContent;

    } catch (error) {
      console.error('Content save error:', error);
      throw new Error('Failed to save content to archive');
    }
  }

  async searchContent(query: string, userFid: number, limit: number = 10): Promise<SearchResult[]> {
    try {
      console.log(`Searching content for user ${userFid}: ${query}`);

      // TODO: Implement vector search with LLM
      // For now, return mock results
      const mockResults: SearchResult[] = [
        {
          content: {
            id: '1',
            url: 'https://example.com/article1',
            title: 'Understanding Blockchain Technology',
            description: 'A comprehensive guide to blockchain fundamentals',
            metadata: { type: 'article' },
            userFid,
            tags: ['blockchain', 'technology'],
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            storageUrls: { arweave: 'ar://abc123', ipfs: 'ipfs://def456' }
          },
          relevanceScore: 0.95,
          excerpt: 'Blockchain is a distributed ledger technology...'
        },
        {
          content: {
            id: '2',
            url: 'https://example.com/article2',
            title: 'DeFi Protocol Analysis',
            description: 'Deep dive into decentralized finance protocols',
            metadata: { type: 'article' },
            userFid,
            tags: ['defi', 'crypto'],
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            storageUrls: { arweave: 'ar://ghi789', ipfs: 'ipfs://jkl012' }
          },
          relevanceScore: 0.87,
          excerpt: 'DeFi protocols enable permissionless financial services...'
        }
      ];

      return mockResults.slice(0, limit);

    } catch (error) {
      console.error('Content search error:', error);
      throw new Error('Failed to search content archive');
    }
  }

  async getRecentContent(userFid: number, limit: number = 5): Promise<SavedContent[]> {
    try {
      console.log(`Getting recent content for user ${userFid}`);

      // TODO: Query database for user's recent saves
      // For now, return mock data
      const mockContent: SavedContent[] = [
        {
          id: '1',
          url: 'https://base.org/docs',
          title: 'How to Build on Base',
          description: 'Complete guide to building on Base network',
          metadata: { type: 'documentation' },
          userFid,
          tags: ['base', 'development'],
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          storageUrls: { arweave: 'ar://base123', ipfs: 'ipfs://base456' }
        },
        {
          id: '2',
          url: 'https://docs.farcaster.xyz/protocol',
          title: 'Farcaster Protocol Deep Dive',
          description: 'Understanding the Farcaster protocol architecture',
          metadata: { type: 'documentation' },
          userFid,
          tags: ['farcaster', 'protocol'],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          storageUrls: { arweave: 'ar://fc789', ipfs: 'ipfs://fc012' }
        }
      ];

      return mockContent.slice(0, limit);

    } catch (error) {
      console.error('Recent content error:', error);
      throw new Error('Failed to get recent content');
    }
  }

  async getUserStats(userFid: number): Promise<{
    totalSaves: number;
    thisMonth: number;
    tagsUsed: number;
    collections: number;
    storageUsed: string;
    topDomain: string;
  }> {
    try {
      console.log(`Getting stats for user ${userFid}`);

      // TODO: Query database for actual statistics
      // For now, return mock data
      return {
        totalSaves: 47,
        thisMonth: 12,
        tagsUsed: 23,
        collections: 8,
        storageUsed: '2.3 MB',
        topDomain: 'github.com'
      };

    } catch (error) {
      console.error('User stats error:', error);
      throw new Error('Failed to get user statistics');
    }
  }

  async addTags(contentId: string, userFid: number, tags: string[]): Promise<SavedContent> {
    try {
      console.log(`Adding tags to content ${contentId} for user ${userFid}:`, tags);

      // TODO: Update content in database
      // For now, return mock updated content
      const mockContent: SavedContent = {
        id: contentId,
        url: 'https://example.com/content',
        title: 'Updated Content',
        description: 'Content with new tags',
        metadata: { type: 'article' },
        userFid,
        tags: ['existing', ...tags],
        createdAt: new Date().toISOString(),
        storageUrls: { arweave: 'ar://updated123', ipfs: 'ipfs://updated456' }
      };

      return mockContent;

    } catch (error) {
      console.error('Add tags error:', error);
      throw new Error('Failed to add tags to content');
    }
  }

  private async uploadToStorage(contentData: any): Promise<{ urls: { arweave?: string; ipfs?: string } }> {
    try {
      // Call the storage API endpoint
      const response = await fetch('/api/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: Buffer.from(JSON.stringify(contentData)).toString('base64'),
          metadata: contentData.metadata,
          storageType: 'both' // Upload to both Arweave and IPFS
        })
      });

      if (!response.ok) {
        throw new Error('Storage upload failed');
      }

      const result = await response.json();
      
      // TODO: Return actual URLs from storage service
      return {
        urls: {
          arweave: `ar://${this.generateHash()}`,
          ipfs: `ipfs://${this.generateHash()}`
        }
      };

    } catch (error) {
      console.error('Storage upload error:', error);
      throw error;
    }
  }

  private async saveToDatabase(contentData: SavedContent): Promise<SavedContent> {
    try {
      // TODO: Implement database save using Supabase or chosen DB
      console.log('Saving to database:', contentData.id);
      
      // For now, just return the data as if saved
      return contentData;

    } catch (error) {
      console.error('Database save error:', error);
      throw error;
    }
  }

  private async mintNFT(content: SavedContent): Promise<string> {
    try {
      // TODO: Implement NFT minting on Base network
      console.log('Minting NFT for content:', content.id);
      
      const mockTokenId = Math.floor(Math.random() * 1000000).toString();
      return mockTokenId;

    } catch (error) {
      console.error('NFT minting error:', error);
      throw error;
    }
  }

  private extractTitle(metadata: any): string {
    if ('title' in metadata && metadata.title) {
      return metadata.title;
    }
    if ('text' in metadata && metadata.text) {
      return metadata.text.slice(0, 100) + '...';
    }
    return 'Saved Content';
  }

  private extractDescription(metadata: any): string {
    if ('description' in metadata && metadata.description) {
      return metadata.description;
    }
    if ('text' in metadata && metadata.text) {
      return metadata.text.slice(0, 300) + '...';
    }
    return 'No description available';
  }

  private extractTags(metadata: any): string[] {
    // TODO: Use LLM to extract relevant tags from content
    const tags: string[] = [];
    
    if ('type' in metadata) {
      tags.push(metadata.type);
    }
    
    // Add more intelligent tag extraction
    return tags;
  }

  private generateContentId(): string {
    return `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateHash(): string {
    return Math.random().toString(36).substr(2, 32);
  }
}