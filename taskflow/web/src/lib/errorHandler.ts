import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'

export function withErrorHandler(handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>) {
  return async (req: NextRequest, ...args: any[]) => {
    try {
      return await handler(req, ...args)
    } catch (error: any) {
      console.error('[API Error]:', error)

      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            message: 'Validation failed',
            errors: error.flatten().fieldErrors,
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { success: false, message: error?.message || 'Internal server error' },
        { status: 500 }
      )
    }
  }
}
