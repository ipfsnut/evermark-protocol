# Evermark Farcaster Bot Architecture

## Overview

The Evermark Bot integrates with the existing Neynar infrastructure to provide intelligent content preservation and LLM-powered search capabilities directly within Farcaster. Users can interact with the bot to save content, search their personal archive, and get AI-powered insights.

## Current Infrastructure Analysis

✅ **Existing Capabilities:**
- Full Neynar SDK integration (@neynar/nodejs-sdk v2.19.0)
- User authentication and session management
- Push notification system
- Webhook handling for miniapp events
- User preference storage (KV store)

## Bot Command Structure

### Core Commands

#### `/save [url]`
- **Purpose**: Preserve content to permanent storage
- **Process**: 
  1. Extract metadata using metadata-kit
  2. Upload to ArDrive/IPFS via everservice
  3. Mint NFT on Base network
  4. Add to user's searchable index
- **Response**: Confirmation with storage details

#### `/search [query]`
- **Purpose**: LLM-powered search of user's saved content
- **Process**:
  1. Query user's content index via everservice
  2. Use LLM to rank and summarize results
  3. Return relevant content with context
- **Response**: Formatted results with links and summaries

#### `/recent [count=5]`
- **Purpose**: Show recently saved content
- **Process**: Query everservice API for latest saves
- **Response**: List of recent items with metadata

#### `/stats`
- **Purpose**: Show user's archive statistics
- **Process**: Aggregate data from user's saves
- **Response**: Total saves, storage used, categories

### Advanced Commands

#### `/tag [url] [tags]`
- **Purpose**: Add custom tags to saved content
- **Process**: Update metadata in everservice database
- **Response**: Confirmation of tag addition

#### `/collections`
- **Purpose**: Show user's content collections
- **Process**: Group saves by type/topic using LLM
- **Response**: Organized content categories

#### `/insights`
- **Purpose**: AI-powered insights about user's content
- **Process**: LLM analysis of content patterns
- **Response**: Personalized insights and trends

## Architecture Components

### 1. Bot Event Handler (New)
**Location**: `everservice/src/app/api/bot/route.ts`
**Purpose**: Handle Farcaster cast events and parse commands

```typescript
// Process mentions and direct casts
// Parse commands and route to appropriate handlers
// Validate user permissions and rate limits
```

### 2. Command Processors (New)
**Location**: `everservice/src/lib/bot/commands/`
**Purpose**: Individual command implementations

```typescript
// saveCommand.ts - Handle /save operations
// searchCommand.ts - LLM-powered search
// recentCommand.ts - Recent content queries
// statsCommand.ts - User statistics
```

### 3. Bot Response System (New)
**Location**: `everservice/src/lib/bot/responses/`
**Purpose**: Format and send responses via Neynar

```typescript
// responseFormatter.ts - Format bot replies
// castSender.ts - Send replies via Neynar API
// threadManager.ts - Handle threaded conversations
```

### 4. Enhanced Webhook Handler (Modified)
**Location**: `protocol-webapp/src/app/api/webhook/route.ts`
**Purpose**: Extend existing webhook to handle bot mentions

```typescript
// Add bot mention detection
// Forward relevant events to everservice bot handler
// Maintain existing miniapp functionality
```

## Integration Points

### With Existing Systems

#### Metadata-Kit SDK
- Use existing content extraction services
- Extend with LLM-powered categorization
- Add social media metadata enrichment

#### Everservice API
- Leverage existing storage endpoints
- Add bot-specific user management
- Implement content indexing for search

#### Neynar Infrastructure
- Use existing authentication system
- Extend notification system for bot alerts
- Leverage user management and preferences

### With External Services

#### LLM Integration
- OpenAI/Anthropic for content analysis
- Vector search for semantic content matching
- Smart tagging and categorization

#### Blockchain Integration
- Automatic NFT minting for preserved content
- Gas optimization for bulk operations
- Ownership verification and transfers

## User Experience Flow

### First Interaction
1. User mentions @evermark bot with `/save [url]`
2. Bot checks if user is authenticated (via existing auth)
3. If new user, send onboarding notification
4. Process save command and respond with confirmation

### Ongoing Usage
1. User can interact via mentions or DMs
2. Bot maintains conversation context
3. Proactive notifications for interesting content
4. Smart suggestions based on user patterns

### Advanced Features
1. Automatic saving from followed patterns
2. Weekly digest of interesting content
3. Collaborative collections with other users
4. Integration with Frame for rich UI

## Technical Implementation Plan

### Phase 1: Core Bot Infrastructure
- [ ] Bot event handler and command parsing
- [ ] Basic save and search commands
- [ ] Integration with existing everservice APIs
- [ ] Simple response formatting

### Phase 2: Enhanced Features
- [ ] LLM-powered search and insights
- [ ] Advanced command set (tag, collections, stats)
- [ ] Proactive notifications and suggestions
- [ ] Rate limiting and user management

### Phase 3: Advanced Integration
- [ ] Frame integration for rich interactions
- [ ] Collaborative features and sharing
- [ ] Analytics and user behavior insights
- [ ] Advanced LLM capabilities

## Security Considerations

### Authentication
- Leverage existing Neynar auth system
- Validate user permissions for content access
- Rate limiting per user and globally

### Data Privacy
- Content encryption for sensitive saves
- User preference for public/private content
- GDPR compliance for data deletion

### Bot Abuse Prevention
- Rate limiting per user and command type
- Spam detection for repeated commands
- Moderation hooks for inappropriate content

## Monitoring and Analytics

### Bot Performance
- Command success/failure rates
- Response times for different operations
- User engagement metrics

### User Behavior
- Most popular commands and content types
- Search query patterns and success rates
- Content categorization accuracy

### System Health
- API endpoint performance
- Storage system utilization
- LLM service costs and efficiency

## Next Steps

1. Create bot webhook endpoint in everservice
2. Implement basic command parsing and routing
3. Build save command integration with existing APIs
4. Test with real Farcaster interactions
5. Add LLM integration for search capabilities
6. Expand command set based on user feedback