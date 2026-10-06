import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neon } from '@neondatabase/serverless'

const connectionString = process.env.DATABASE_URL!

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// If we are in local development and the DATABASE_URL is not pointing to Neon,
// we fall back to a standard PrismaClient so local dev with Docker works without errors.
const isNeon = connectionString.includes('neon.tech')

export const prisma =
  globalForPrisma.prisma ||
  (isNeon
    ? new PrismaClient({ adapter: new PrismaNeon(neon(connectionString)) })
    : new PrismaClient())

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
