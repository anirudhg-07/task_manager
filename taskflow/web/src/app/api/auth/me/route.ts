import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/middleware/auth'
import { withErrorHandler } from '@/lib/errorHandler'

async function meHandler(req: AuthenticatedRequest) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      full_name: true,
      email: true,
      created_at: true,
      updated_at: true,
    },
  })

  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: user })
}

export const GET = withErrorHandler(withAuth(meHandler))
