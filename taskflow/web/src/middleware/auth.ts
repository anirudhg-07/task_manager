import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, JwtPayload } from '../lib/jwt'

export interface AuthenticatedRequest extends NextRequest {
  user?: JwtPayload
}

export function withAuth(handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>) {
  return async (req: AuthenticatedRequest, ...args: any[]) => {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    try {
      const decoded = verifyAccessToken(token)
      req.user = decoded
      return await handler(req, ...args)
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Invalid or expired token' },
        { status: 401 }
      )
    }
  }
}
