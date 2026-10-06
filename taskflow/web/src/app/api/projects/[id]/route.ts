import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/middleware/auth'
import { withErrorHandler } from '@/lib/errorHandler'
import { UpdateProjectSchema } from '@/schemas'

async function getProjectHandler(req: AuthenticatedRequest, { params }: { params: { id: string } }) {
  const project = await prisma.project.findFirst({
    where: {
      id: params.id,
      user_id: req.user!.id,
    },
    include: {
      tasks: {
        orderBy: { created_at: 'desc' },
      },
    },
  })

  if (!project) {
    return NextResponse.json({ success: false, message: 'Project not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: project })
}

async function updateProjectHandler(req: AuthenticatedRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const data = UpdateProjectSchema.parse(body)

  const existing = await prisma.project.findFirst({
    where: { id: params.id, user_id: req.user!.id },
  })

  if (!existing) {
    return NextResponse.json({ success: false, message: 'Project not found' }, { status: 404 })
  }

  const project = await prisma.project.update({
    where: { id: params.id },
    data,
  })

  return NextResponse.json({ success: true, data: project })
}

async function deleteProjectHandler(req: AuthenticatedRequest, { params }: { params: { id: string } }) {
  const existing = await prisma.project.findFirst({
    where: { id: params.id, user_id: req.user!.id },
  })

  if (!existing) {
    return NextResponse.json({ success: false, message: 'Project not found' }, { status: 404 })
  }

  await prisma.project.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ success: true, message: 'Project deleted successfully' })
}

export const GET = withErrorHandler(withAuth(getProjectHandler))
export const PUT = withErrorHandler(withAuth(updateProjectHandler))
export const DELETE = withErrorHandler(withAuth(deleteProjectHandler))
