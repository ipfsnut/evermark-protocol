# CLAUDE.md - Development Guidelines for Evermark Protocol

This file provides guidance to Claude Code when working with the Evermark Protocol workspace.

## Project Overview

Evermark Protocol is an LLM-powered digital memory platform consisting of three main components:
- **Protocol Webapp**: Next.js frontend with Farcaster/Neynar integration
- **Everservice**: Backend API service for content processing and search
- **Metadata Kit**: SDK for content extraction and metadata processing

## Development Commands

### Workspace Management
- `npm run dev` - Start all services in development mode
- `npm run build` - Build all packages
- `npm run test` - Run tests across all packages
- `npm run lint` - Lint all code

### Individual Package Development
- `cd protocol-webapp && npm run dev` - Frontend development server
- `cd everservice && npm run dev` - Backend API server
- `cd metadata-kit && npm run build` - Build SDK package

## File Management Guidelines

### IMPORTANT: Auto-Ignore Policy
**Unless explicitly specified by the user, ALWAYS add the following to .gitignore when created:**
- Scripts (*.js, *.ts, *.py, *.sh) unless they are source code
- Markdown files (*.md) except for documentation
- Temporary files and logs
- Build artifacts and dependencies

### Directory Structure
```
evermark-protocol-workspace/
├── protocol-webapp/        # Next.js frontend
├── everservice/           # Backend API service  
├── metadata-kit/          # Content processing SDK
├── contracts/             # Smart contracts from beta
├── docs/                  # Shared documentation
├── package.json           # Monorepo configuration
├── VISION.md              # Project vision (tracked)
├── CLAUDE.md             # This file (tracked)
└── workspace.md          # Development tracking (tracked)
```

## Architecture Principles

### Monorepo Structure
- Each package is independently deployable
- Shared dependencies managed at workspace root
- Cross-package imports via workspace references
- Consistent tooling and configuration

### Code Quality Standards
- TypeScript strict mode for all packages
- ESLint + Prettier for consistent formatting
- Comprehensive error handling and logging
- Unit tests for business logic
- Integration tests for API endpoints

### Migration Strategy from Beta
When migrating code from the beta codebase:

1. **Smart Contracts**: Copy directly to `contracts/` directory
2. **Services**: Extract pure business logic to appropriate packages
3. **Components**: Adapt React components for Next.js App Router
4. **Types**: Consolidate TypeScript interfaces in shared locations
5. **Tests**: Update imports and adapt to new structure

## Package-Specific Guidelines

### Protocol Webapp (Frontend)
- Next.js 14+ with App Router
- Neynar/Farcaster SDK integration
- Tailwind CSS for styling
- React Query for state management
- Component-driven development

### Everservice (Backend)
- Next.js API routes or standalone Express server
- PostgreSQL with Prisma ORM
- Redis for caching and job queues
- Background job processing
- LLM integration (OpenAI/Anthropic)

### Metadata Kit (SDK)
- Pure TypeScript library
- Content extraction utilities
- Metadata enrichment services
- Export as npm package
- Comprehensive documentation

## Environment Variables

### Development Setup
Copy working configuration from beta codebase:
```bash
# Blockchain
VITE_THIRDWEB_CLIENT_ID=
VITE_CHAIN_ID=8453

# Database  
DATABASE_URL=
REDIS_URL=

# Storage
ARWEAVE_KEY=
IPFS_API_KEY=

# LLM Services
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Farcaster/Neynar
NEYNAR_API_KEY=
FARCASTER_MINI_APP_ID=
```

## Development Workflow

### Adding New Features
1. Create feature branch from main
2. Develop in appropriate package directory
3. Add tests for new functionality
4. Update documentation as needed
5. Submit PR with clear description

### Beta Migration Process
1. Identify component in beta codebase
2. Determine target location in new structure
3. Extract and adapt code
4. Update imports and dependencies
5. Test functionality in new environment
6. Document any breaking changes

### Testing Strategy
- Unit tests for pure functions
- Integration tests for API endpoints
- E2E tests for critical user flows
- Manual testing in Farcaster environment

## Tooling Configuration

### TypeScript
- Strict mode enabled
- Path mapping for clean imports
- Shared tsconfig.json base configuration

### ESLint & Prettier
- Consistent formatting across packages
- Import order enforcement
- TypeScript-specific rules

### Git Workflow
- Main branch for stable releases
- Feature branches for development
- Conventional commit messages
- Automated testing on PRs

## Documentation Standards

### Code Documentation
- JSDoc comments for public APIs
- Inline comments for complex logic
- README files for each package
- API documentation for services

### Architecture Documentation
- Decision records for major changes
- System diagrams for complex flows
- Migration guides for beta features
- Deployment instructions

## Performance Considerations

### Frontend Optimization
- Code splitting and lazy loading
- Image optimization and caching
- Bundle size monitoring
- Core Web Vitals tracking

### Backend Optimization
- Database query optimization
- Redis caching strategies
- Background job processing
- LLM request batching

## Security Guidelines

### Data Protection
- Encrypt sensitive user data
- Secure API key management
- Input validation and sanitization
- Rate limiting on endpoints

### Blockchain Security
- Secure private key handling
- Transaction validation
- Smart contract interaction safety
- Gas optimization strategies

## Deployment Strategy

### Development Environment
- Local development with hot reload
- Docker containers for consistency
- Environment variable management
- Database migrations

### Production Deployment
- Railway for backend services
- Vercel/Netlify for frontend
- Automated CI/CD pipelines
- Monitoring and alerting

---

## Current Development Status

Track progress and decisions in `workspace.md`. Update this file as the architecture evolves and new patterns emerge.

**Remember**: Always err on the side of adding files to .gitignore unless explicitly told otherwise by the user.