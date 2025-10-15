// Basic types for Metadata Kit - simplified for SDK use

export interface PaperMetadata {
  title: string;
  authors: string[];
  abstract?: string;
  journal?: string;
  publisher?: string;
  publishedDate?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  citations?: number;
}

export interface BookMetadata {
  title: string;
  authors: string[];
  isbn?: string;
  publisher?: string;
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  categories?: string[];
  thumbnail?: string;
  language?: string;
}

export interface WebMetadata {
  title?: string;
  description?: string;
  url: string;
  image?: string;
  siteName?: string;
  author?: string;
  publishedDate?: string;
  type?: string;
}

export interface CastMetadata {
  text: string;
  author: {
    fid: number;
    username: string;
    displayName: string;
    avatar?: string;
  };
  timestamp: string;
  hash: string;
  replies?: number;
  likes?: number;
  recasts?: number;
  embeds?: any[];
  parent?: string;
}

export interface TweetMetadata {
  text: string;
  author: {
    username: string;
    displayName: string;
    avatar?: string;
  };
  timestamp: string;
  id: string;
  replies?: number;
  likes?: number;
  retweets?: number;
  media?: any[];
}

export interface StorageCost {
  bytes: number;
  costUSD: number;
  currency: string;
  provider: 'arweave' | 'ipfs';
}

// Generic metadata type that all services can return
export type ContentMetadata = PaperMetadata | BookMetadata | WebMetadata | CastMetadata | TweetMetadata;