import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/middleware/auth'
import { withErrorHandler } from '@/lib/errorHandler'
import crypto from 'crypto'

async function logoutHandler(req: AuthenticatedRequest) {
  const body = await req.json().catch(() => ({}))
  const { refreshToken } = body

  if (refreshToken) {
    const token_hash = crypto.createHash('sha256').update(refreshToken).digest('hex')
    await prisma.refreshToken.deleteMany({
      where: {
        token_hash,
        user_id: req.user!.id,
      },
    })
  }

  return NextResponse.json({ success: true, message: 'Logged out successfully' })
}

export const POST = withErrorHandler(withAuth(logoutHandler))
