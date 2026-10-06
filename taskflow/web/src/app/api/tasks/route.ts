import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/middleware/auth'
import { withErrorHandler } from '@/lib/errorHandler'
import { TaskSchema } from '@/schemas'

async function getTasksHandler(req: AuthenticatedRequest) {
  const url = new URL(req.url)
  const search = url.searchParams.get('search')
  const status = url.searchParams.get('status')
  const priority = url.searchParams.get('priority')
  const project_id = url.searchParams.get('project_id')

  const whereClause: any = {
    user_id: req.user!.id,
  }

  if (search) whereClause.name = { contains: search, mode: 'insensitive' }
  if (status) whereClause.status = status
  if (priority) whereClause.priority = priority
  if (project_id) whereClause.project_id = project_id

  const tasks = await prisma.task.findMany({
    where: whereClause,
    orderBy: { created_at: 'desc' },
  })

  return NextResponse.json({ success: true, data: tasks })
}

async function createTaskHandler(req: AuthenticatedRequest) {
  const body = await req.json()
  const data = TaskSchema.parse(body)

  // Ensure the user owns the project they are adding a task to
  const project = await prisma.project.findFirst({
    where: { id: data.project_id, user_id: req.user!.id },
  })

  if (!project) {
    return NextResponse.json({ success: false, message: 'Project not found or unauthorized' }, { status: 404 })
  }

  const task = await prisma.task.create({
    data: {
      ...data,
      user_id: req.user!.id,
    },
  })

  return NextResponse.json({ success: true, data: task }, { status: 201 })
}

export const GET = withErrorHandler(withAuth(getTasksHandler))
export const POST = withErrorHandler(withAuth(createTaskHandler))
