# @evermark/metadata-kit

Content extraction and metadata processing SDK for the Evermark Protocol.

## Overview

The Metadata Kit provides a unified interface for extracting metadata from various content sources including academic papers (DOI), books (ISBN), social media posts (Farcaster, Twitter), and general web content.

## Features

- **DOI Resolution**: Extract metadata from academic papers
- **ISBN Processing**: Get book information from ISBN codes
- **Web Metadata**: Extract titles, descriptions, images from web pages
- **Farcaster Integration**: Process cast content and metadata
- **Twitter Support**: Extract tweet content and author information
- **ArDrive Pricing**: Calculate storage costs for permanent archiving

## Installation

```bash
npm install @evermark/metadata-kit
```

## Usage

```typescript
import { MetadataKit } from '@evermark/metadata-kit';

const kit = new MetadataKit();

// Extract metadata from any URL
const metadata = await kit.extractMetadata('https://example.com/article');

// Calculate storage cost
const cost = await kit.calculateStorageCost(1024 * 1024); // 1MB

// Extract ISBN from text
const isbn = await kit.extractISBN('ISBN: 978-0-123456-78-9');
```

## Individual Services

You can also import and use individual services:

```typescript
import { DOIService, ISBNService, FarcasterService } from '@evermark/metadata-kit';

const doiService = new DOIService();
const paper = await doiService.extractDOIMetadata('https://doi.org/10.1000/example');
```

## Development

```bash
# Build the package
npm run build

# Watch for changes
npm run dev

# Run tests
npm run test

# Type check
npm run typecheck
```

## License

MIT