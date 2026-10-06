import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import { signAccessToken, signRefreshToken } from '@/lib/jwt'
import { LoginSchema } from '@/schemas'
import { withErrorHandler } from '@/lib/errorHandler'
import { authRateLimit } from '@/lib/ratelimit'
import crypto from 'crypto'

async function loginHandler(req: NextRequest) {
  if (authRateLimit) {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
    const { success } = await authRateLimit.limit(ip)
    if (!success) {
      return NextResponse.json({ success: false, message: 'Too many requests' }, { status: 429 })
    }
  }

  const body = await req.json()
  const data = LoginSchema.parse(body)

  const user = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (!user) {
    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
  }

  const isValidPassword = await compare(data.password, user.password_hash)

  if (!isValidPassword) {
    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
  }

  const accessToken = signAccessToken({ id: user.id, email: user.email })
  const refreshToken = signRefreshToken({ id: user.id, email: user.email })

  const token_hash = crypto.createHash('sha256').update(refreshToken).digest('hex')
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await prisma.refreshToken.create({
    data: {
      user_id: user.id,
      token_hash,
      expires_at,
    },
  })

  return NextResponse.json({
    success: true,
    data: {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
      },
      accessToken,
      refreshToken,
    },
  })
}

export const POST = withErrorHandler(loginHandler)
