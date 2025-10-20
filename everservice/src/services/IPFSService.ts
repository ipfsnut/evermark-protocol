import type { ContentMetadata } from '../types/evermark';

/**
 * IPFS Service for storing Evermark metadata and media
 * Uses Pinata as the IPFS pinning service
 */
export class IPFSService {
  private static readonly PINATA_API_BASE = 'https://api.pinata.cloud';
  private static readonly PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs';

  /**
   * Upload metadata JSON to IPFS
   */
  static async uploadMetadata(metadata: ContentMetadata): Promise<{ 
    success: boolean; 
    ipfsHash?: string; 
    ipfsUrl?: string;
    error?: string; 
  }> {
    try {
      console.log('📤 Uploading metadata to IPFS:', metadata);

      const pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT;
      if (!pinataJWT) {
        console.warn('⚠️ PINATA_JWT not found, skipping IPFS upload');
        return {
          success: false,
          error: 'IPFS configuration not available'
        };
      }

      // Create NFT-compatible metadata structure
      const nftMetadata = {
        name: metadata.title,
        description: metadata.description || '',
        image: metadata.extendedMetadata?.imageUrl || '',
        attributes: [
          {
            trait_type: 'Content Type',
            value: metadata.contentType
          },
          {
            trait_type: 'Author',
            value: metadata.author || 'Unknown'
          },
          {
            trait_type: 'Source URL',
            value: metadata.sourceUrl || ''
          },
          ...((metadata.tags || []).map(tag => ({
            trait_type: 'Tag',
            value: tag
          })))
        ],
        // Extended metadata for Evermark-specific data
        evermark: {
          version: '1.0',
          sourceUrl: metadata.sourceUrl,
          contentType: metadata.contentType,
          tags: metadata.tags || [],
          extendedMetadata: metadata.extendedMetadata || {}
        }
      };

      console.log('📋 NFT Metadata structure:', nftMetadata);

      // Upload to Pinata
      const response = await fetch(`${this.PINATA_API_BASE}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pinataJWT}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pinataContent: nftMetadata,
          pinataMetadata: {
            name: `evermark-${metadata.title.slice(0, 50)}`,
            keyvalues: {
              contentType: metadata.contentType,
              author: metadata.author || '',
              createdAt: new Date().toISOString()
            }
          }
        }),
      });

      console.log('📡 Pinata API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Pinata API Error:', errorText);
        throw new Error(`Pinata upload failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Pinata upload result:', result);

      const ipfsHash = result.IpfsHash;
      const ipfsUrl = `${this.PINATA_GATEWAY}/${ipfsHash}`;

      return {
        success: true,
        ipfsHash,
        ipfsUrl
      };

    } catch (error) {
      console.error('IPFS upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown IPFS error'
      };
    }
  }

  /**
   * Upload file (image/media) to IPFS
   */
  static async uploadFile(file: File | Buffer, filename: string): Promise<{
    success: boolean;
    ipfsHash?: string;
    ipfsUrl?: string;
    error?: string;
  }> {
    try {
      console.log('📤 Uploading file to IPFS:', filename);

      const pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT;
      if (!pinataJWT) {
        return {
          success: false,
          error: 'IPFS configuration not available'
        };
      }

      const formData = new FormData();
      
      if (file instanceof Buffer) {
        const blob = new Blob([file]);
        formData.append('file', blob, filename);
      } else {
        formData.append('file', file, filename);
      }

      formData.append('pinataMetadata', JSON.stringify({
        name: filename,
        keyvalues: {
          type: 'evermark-media',
          uploadedAt: new Date().toISOString()
        }
      }));

      const response = await fetch(`${this.PINATA_API_BASE}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pinataJWT}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Pinata file upload error:', errorText);
        throw new Error(`Pinata file upload failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Pinata file upload result:', result);

      const ipfsHash = result.IpfsHash;
      const ipfsUrl = `${this.PINATA_GATEWAY}/${ipfsHash}`;

      return {
        success: true,
        ipfsHash,
        ipfsUrl
      };

    } catch (error) {
      console.error('IPFS file upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown IPFS file upload error'
      };
    }
  }

  /**
   * Fetch content from IPFS
   */
  static async fetchFromIPFS(ipfsHash: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const ipfsUrl = `${this.PINATA_GATEWAY}/${ipfsHash}`;
      console.log('📥 Fetching from IPFS:', ipfsUrl);

      const response = await fetch(ipfsUrl);
      
      if (!response.ok) {
        throw new Error(`IPFS fetch failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ IPFS data fetched:', data);

      return {
        success: true,
        data
      };

    } catch (error) {
      console.error('IPFS fetch error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown IPFS fetch error'
      };
    }
  }

  /**
   * Generate IPFS URL from hash
   */
  static getIPFSUrl(ipfsHash: string): string {
    return `${this.PINATA_GATEWAY}/${ipfsHash}`;
  }

  /**
   * Validate IPFS hash format
   */
  static isValidIPFSHash(hash: string): boolean {
    // IPFS hashes typically start with Qm or ba and are base58 encoded
    return /^(Qm[1-9A-HJ-NP-Za-km-z]{44,}|ba[A-Za-z2-7]{56,})$/.test(hash);
  }

  /**
   * Pin existing IPFS content (if we need to re-pin content)
   */
  static async pinByHash(ipfsHash: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT;
      if (!pinataJWT) {
        return {
          success: false,
          error: 'IPFS configuration not available'
        };
      }

      const response = await fetch(`${this.PINATA_API_BASE}/pinning/pinByHash`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pinataJWT}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hashToPin: ipfsHash,
          pinataMetadata: {
            name: `re-pinned-${ipfsHash}`,
            keyvalues: {
              type: 'evermark-repin',
              originalHash: ipfsHash,
              repinnedAt: new Date().toISOString()
            }
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pin by hash failed: ${response.status} ${errorText}`);
      }

      console.log('✅ Content re-pinned successfully');
      return { success: true };

    } catch (error) {
      console.error('Pin by hash error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown pin error'
      };
    }
  }
}

export default IPFSService;