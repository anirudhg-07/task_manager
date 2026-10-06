import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/lib/jwt'
import { withErrorHandler } from '@/lib/errorHandler'
import { authRateLimit } from '@/lib/ratelimit'
import crypto from 'crypto'

async function refreshHandler(req: NextRequest) {
  if (authRateLimit) {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
    const { success } = await authRateLimit.limit(ip)
    if (!success) {
      return NextResponse.json({ success: false, message: 'Too many requests' }, { status: 429 })
    }
  }

  const body = await req.json().catch(() => ({}))
  const { refreshToken } = body

  if (!refreshToken) {
    return NextResponse.json({ success: false, message: 'Refresh token is required' }, { status: 400 })
  }

  try {
    const decoded = verifyRefreshToken(refreshToken)
    const token_hash = crypto.createHash('sha256').update(refreshToken).digest('hex')

    const existingToken = await prisma.refreshToken.findFirst({
      where: {
        token_hash,
        user_id: decoded.id,
        expires_at: { gt: new Date() },
      },
    })

    if (!existingToken) {
      return NextResponse.json({ success: false, message: 'Invalid or expired refresh token' }, { status: 401 })
    }

    // Delete the old refresh token (rotation)
    await prisma.refreshToken.delete({ where: { id: existingToken.id } })

    const newAccessToken = signAccessToken({ id: decoded.id, email: decoded.email })
    const newRefreshToken = signRefreshToken({ id: decoded.id, email: decoded.email })
    const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex')
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await prisma.refreshToken.create({
      data: {
        user_id: decoded.id,
        token_hash: newTokenHash,
        expires_at,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid refresh token' }, { status: 401 })
  }
}

export const POST = withErrorHandler(refreshHandler)
