// Core types for Evermark content processing

export interface FarcasterCastData {
  castHash?: string;
  author?: string;
  username?: string;
  content?: string;
  timestamp?: string;
  engagement?: {
    likes: number;
    recasts: number;
    replies: number;
  };
  author_pfp?: string;
  author_fid?: number;
  channel?: string;
  embeds?: Array<{
    url?: string;
    cast_id?: any;
    metadata?: any;
  }>;
}

export interface TwitterTweetData {
  tweetId?: string;
  author?: string;
  username?: string;
  content?: string;
  timestamp?: string;
  metrics?: {
    likes: number;
    retweets: number;
    replies: number;
  };
}

export interface ContentMetadata {
  title: string;
  author?: string;
  description?: string;
  contentType: 'Cast' | 'Tweet' | 'URL' | 'DOI' | 'ISBN' | 'Custom';
  sourceUrl?: string;
  tags?: string[];
  extendedMetadata?: {
    castData?: FarcasterCastData;
    tweetData?: TwitterTweetData;
    [key: string]: any;
  };
}

export interface ProcessingResult {
  success: boolean;
  metadata?: ContentMetadata;
  ipfsHash?: string;
  imageUrl?: string;
  error?: string;
}

export interface EvermarkCreationRequest {
  url: string;
  userFid?: number;
  userId?: string;
}

export interface EvermarkCreationResponse {
  success: boolean;
  tokenId?: number;
  metadata?: ContentMetadata;
  ipfsHash?: string;
  txHash?: string;
  error?: string;
}