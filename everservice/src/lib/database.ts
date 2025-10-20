import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export default db

// Helper functions for common database operations
export async function getOrCreateUser(fid: number, userData?: {
  username?: string
  displayName?: string
  pfpUrl?: string
  bio?: string
  walletAddress?: string
}) {
  const existingUser = await db.user.findUnique({
    where: { fid }
  })
  
  if (existingUser) {
    // Update user data if provided
    if (userData) {
      return await db.user.update({
        where: { fid },
        data: userData
      })
    }
    return existingUser
  }
  
  // Create new user
  return await db.user.create({
    data: {
      fid,
      ...userData
    }
  })
}

export async function createEvermark(data: {
  title: string
  author?: string
  description?: string
  contentType?: string
  sourceUrl?: string
  userId?: string
  tokenId?: number
}) {
  return await db.evermark.create({
    data: {
      tokenId: data.tokenId || Math.floor(Math.random() * 1000000), // Temporary until real minting
      title: data.title,
      author: data.author,
      description: data.description,
      contentType: data.contentType || 'URL',
      sourceUrl: data.sourceUrl,
      userId: data.userId,
      cacheStatus: 'pending',
      imageProcessingStatus: 'pending'
    }
  })
}

export async function getEvermarksByUser(userId: string, limit: number = 10) {
  return await db.evermark.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: {
        select: {
          username: true,
          displayName: true,
          pfpUrl: true
        }
      }
    }
  })
}

export async function getRecentEvermarks(limit: number = 20) {
  return await db.evermark.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: {
        select: {
          username: true,
          displayName: true,
          pfpUrl: true
        }
      },
      votes: {
        select: {
          weight: true
        }
      }
    }
  })
}

export async function updateEvermarkProcessingStatus(
  tokenId: number,
  updates: {
    metadataJson?: string
    ipfsImageHash?: string
    ipfsMetadataHash?: string
    imageProcessingStatus?: string
    cacheStatus?: string
    processingErrors?: string
  }
) {
  return await db.evermark.update({
    where: { tokenId },
    data: {
      ...updates,
      metadataProcessedAt: new Date()
    }
  })
}