import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/middleware/auth'
import { withErrorHandler } from '@/lib/errorHandler'

async function dashboardHandler(req: AuthenticatedRequest) {
  const user_id = req.user!.id

  const [totalProjects, projectsByStatus, totalTasks, tasksByStatus] = await Promise.all([
    prisma.project.count({ where: { user_id } }),
    prisma.project.groupBy({ by: ['status'], where: { user_id }, _count: true }),
    prisma.task.count({ where: { user_id } }),
    prisma.task.groupBy({ by: ['status'], where: { user_id }, _count: true }),
  ])

  // Process grouped queries into easier key-value formats
  const projectsStatusCount = projectsByStatus.reduce((acc, curr) => {
    acc[curr.status] = curr._count
    return acc
  }, {} as Record<string, number>)

  const tasksStatusCount = tasksByStatus.reduce((acc, curr) => {
    acc[curr.status] = curr._count
    return acc
  }, {} as Record<string, number>)

  return NextResponse.json({
    success: true,
    data: {
      totalProjects,
      totalTasks,
      completedTasks: tasksStatusCount['completed'] || 0,
      pendingTasks: tasksStatusCount['pending'] || 0,
      projectsInProgress: projectsStatusCount['in_progress'] || 0,
    },
  })
}

export const GET = withErrorHandler(withAuth(dashboardHandler))
