import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/middleware/auth'
import { withErrorHandler } from '@/lib/errorHandler'
import { UpdateTaskSchema } from '@/schemas'

async function getTaskHandler(req: AuthenticatedRequest, { params }: { params: { id: string } }) {
  const task = await prisma.task.findFirst({
    where: {
      id: params.id,
      user_id: req.user!.id,
    },
  })

  if (!task) {
    return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: task })
}

async function updateTaskHandler(req: AuthenticatedRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const data = UpdateTaskSchema.parse(body)

  const existing = await prisma.task.findFirst({
    where: { id: params.id, user_id: req.user!.id },
  })

  if (!existing) {
    return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 })
  }

  const task = await prisma.task.update({
    where: { id: params.id },
    data,
  })

  return NextResponse.json({ success: true, data: task })
}

async function deleteTaskHandler(req: AuthenticatedRequest, { params }: { params: { id: string } }) {
  const existing = await prisma.task.findFirst({
    where: { id: params.id, user_id: req.user!.id },
  })

  if (!existing) {
    return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 })
  }

  await prisma.task.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ success: true, message: 'Task deleted successfully' })
}

export const GET = withErrorHandler(withAuth(getTaskHandler))
export const PUT = withErrorHandler(withAuth(updateTaskHandler))
export const DELETE = withErrorHandler(withAuth(deleteTaskHandler))
