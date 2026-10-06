import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/middleware/auth'
import { withErrorHandler } from '@/lib/errorHandler'
import { ProjectSchema } from '@/schemas'

async function getProjectsHandler(req: AuthenticatedRequest) {
  const url = new URL(req.url)
  const search = url.searchParams.get('search')
  const status = url.searchParams.get('status')

  const whereClause: any = {
    user_id: req.user!.id,
  }

  if (search) {
    whereClause.name = { contains: search, mode: 'insensitive' }
  }

  if (status) {
    whereClause.status = status
  }

  const projects = await prisma.project.findMany({
    where: whereClause,
    orderBy: { created_at: 'desc' },
  })

  return NextResponse.json({ success: true, data: projects })
}

async function createProjectHandler(req: AuthenticatedRequest) {
  const body = await req.json()
  const data = ProjectSchema.parse(body)

  const project = await prisma.project.create({
    data: {
      ...data,
      user_id: req.user!.id,
    },
  })

  return NextResponse.json({ success: true, data: project }, { status: 201 })
}

export const GET = withErrorHandler(withAuth(getProjectsHandler))
export const POST = withErrorHandler(withAuth(createProjectHandler))
