import { PrismaClient } from '@prisma/client'

type PageBackgroundDelegate = {
  findUnique: (...args: unknown[]) => Promise<unknown>
  findMany: (...args: unknown[]) => Promise<unknown[]>
  update: (...args: unknown[]) => Promise<unknown>
}

type BackgroundImageDelegate = {
  deleteMany: (...args: unknown[]) => Promise<unknown>
  createMany: (...args: unknown[]) => Promise<unknown>
}

type ExtendedPrismaClient = PrismaClient & {
  pageBackground: PageBackgroundDelegate
  backgroundImage: BackgroundImageDelegate
}

const globalForPrisma = globalThis as unknown as { prisma?: ExtendedPrismaClient }

const prisma: ExtendedPrismaClient = globalForPrisma.prisma ?? (new PrismaClient() as ExtendedPrismaClient)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
