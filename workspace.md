# Evermark Protocol Workspace

## Project Status: Initial Setup

**Current Phase**: Foundation setup and Neynar scaffolding  
**Started**: October 14, 2025  
**Team**: Dylan + Claude Code

## Project Overview

Building an LLM-powered digital memory platform that enables users to create searchable archives of their entire online presence. The system combines blockchain ownership, permanent storage, and AI-powered indexing to create a "external brain" for digital content.

## Todo List

### Phase 1: Workspace Foundation ✅
- [x] Rename evermark-protocol to evermark-protocol-workspace
- [x] Create VISION.md with complete project concept
- [x] Create CLAUDE.md with development guidelines
- [x] Create workspace.md for project tracking

### Phase 2: Monorepo Setup ✅
- [x] Initialize monorepo package.json with workspaces
- [x] Create component directory structure
- [x] Set up Neynar/Next.js foundation for protocol-webapp

### Phase 3: Component Setup ✅
- [x] Extract smart contracts from beta to contracts/
- [x] Package metadata services into metadata-kit SDK
- [x] Set up everservice backend API structure
- [x] Configure development environment with .env files

## Architecture Decisions

### Monorepo Structure
**Decision**: Use npm workspaces for managing three main components  
**Rationale**: Enables shared dependencies while maintaining package independence  
**Components**:
- `protocol-webapp/` - Next.js frontend with Neynar integration
- `everservice/` - Backend API service  
- `metadata-kit/` - Content processing SDK

### Technology Stack
**Frontend**: Next.js 14 + Neynar + Farcaster SDK  
**Backend**: Next.js API routes + PostgreSQL + Redis  
**Storage**: Arweave (permanent) + IPFS (fast access)  
**LLM**: OpenAI/Anthropic for search and tagging  
**Blockchain**: Base network with existing smart contracts

### Migration Strategy
**Approach**: Extract and adapt valuable code from beta codebase  
**Priority**: Smart contracts → SDK services → Backend logic → Frontend components  
**Testing**: Verify compatibility at each migration step

## Problems & Solutions

### Problem: Complex Beta Codebase
**Issue**: 77k+ lines with 30+ serverless functions  
**Solution**: Clean rebuild with proper server architecture  
**Status**: Architecture planned, ready for implementation

### Problem: Maintaining User Data
**Issue**: Need zero-downtime migration of existing users  
**Solution**: Keep existing Supabase database and smart contracts  
**Status**: Migration strategy defined

## Development Notes

### Current Working Environment
- Beta codebase running locally with full functionality
- All API keys and configurations available for testing
- Smart contracts deployed on Base network
- Supabase database with existing user data

### Key Resources
- `/beta/` - Current complex implementation (77k+ lines)
- `/evermark-contracts/` - Smart contract source code
- `/evermark-sdk/` - Existing SDK utilities
- `/sandbox/` - Experimentation space

### Environment Setup
- **Deployment URL**: https://evermark.epicdylan.com (production)
- **Local Development**: localhost:3000 with optional localtunnel
- **Configuration**: Copy working setup from beta:
  - Blockchain: Thirdweb client, Base network
  - Database: Supabase with existing schema
  - Storage: ArDrive + IPFS configurations  
  - Farcaster: Neynar API keys and mini app setup
  - LLM: OpenAI + Anthropic for search/tagging

## Risk Assessment

### High Risk
- **Migration Complexity**: Large codebase with intricate dependencies
- **User Experience**: Maintaining service during transition
- **Data Integrity**: Preserving all existing content and relationships

### Medium Risk  
- **Technology Changes**: Adapting to Next.js App Router patterns
- **Performance**: Ensuring new architecture matches or exceeds current speed
- **Integration**: Neynar/Farcaster SDK compatibility

### Low Risk
- **Smart Contracts**: Already deployed and tested on Base
- **Storage**: ArDrive and IPFS integrations proven to work
- **Database**: Supabase schema well-established

## Success Metrics

### Technical Milestones
- [x] Successful workspace setup and structure
- [x] Smart contracts extracted with ABIs and deployment config
- [x] Metadata-kit SDK created and building successfully
- [x] Everservice backend API structure created
- [ ] Content upload/retrieval functional (next phase)
- [ ] LLM search capabilities operational (next phase)
- [ ] Beta feature parity achieved (final phase)

### User Experience Goals
- Faster content processing (vs current serverless)
- Improved search relevance with LLM integration  
- Seamless migration for existing users
- Enhanced admin tools and monitoring

## Next Actions

1. **Complete monorepo setup**: Initialize package.json and directories
2. **Run Neynar CLI**: Scaffold the frontend foundation
3. **Test environment**: Verify development setup works
4. **Begin migration**: Start with smart contracts and core services

## Development Log

### October 14, 2025
- ✅ Created workspace foundation with complete documentation
- ✅ Established monorepo structure with npm workspaces  
- ✅ Set up Neynar/Next.js foundation for protocol-webapp
- ✅ Configured environment for https://evermark.epicdylan.com deployment
- ✅ Extracted all smart contracts and ABIs from beta
- ✅ Created metadata-kit SDK with core content extraction services
- ✅ Built everservice backend with API route structure
- ✅ Successfully building metadata-kit and everservice components
- ✅ **Farcaster Bot Integration Complete**
- 🎯 **Ready for LLM enhancement and testing**

### Bot Integration Details
- ✅ Natural language command processing ("evermark this cast", "save [URL]")
- ✅ Context-aware cast processing and content extraction  
- ✅ Full integration with existing metadata-kit and everservice APIs
- ✅ User-specific content archives with search capabilities
- ✅ Webhook endpoints for real-time Farcaster event processing
- ✅ Smart response system with threading for long messages
- ✅ Complete command set: save, search, recent, stats, collections, insights

---

*This workspace.md file tracks our journey building the future of digital memory.*