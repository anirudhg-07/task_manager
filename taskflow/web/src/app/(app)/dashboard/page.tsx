'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { FolderKanban, CheckSquare, Clock, AlertCircle } from 'lucide-react'
import apiClient from '@/lib/apiClient'
import Link from 'next/link'

interface DashboardStats {
  totalProjects: number
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  projectsInProgress: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await apiClient.get('/dashboard')
        setStats(data.data)
      } catch (error) {
        console.error('Failed to fetch stats', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-32 animate-pulse bg-[rgba(255,255,255,0.05)]" />
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    { label: 'Total Projects', value: stats?.totalProjects || 0, icon: FolderKanban, color: 'text-[var(--color-accent)]' },
    { label: 'Projects In Progress', value: stats?.projectsInProgress || 0, icon: Clock, color: 'text-[var(--color-warning)]' },
    { label: 'Total Tasks', value: stats?.totalTasks || 0, icon: CheckSquare, color: 'text-[var(--color-info)]' },
    { label: 'Pending Tasks', value: stats?.pendingTasks || 0, icon: AlertCircle, color: 'text-[var(--color-error)]' },
    { label: 'Completed Tasks', value: stats?.completedTasks || 0, icon: CheckSquare, color: 'text-[var(--color-success)]' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-[var(--color-text-muted)]">Welcome back. Here's what's happening with your projects.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--color-text-muted)]">{stat.label}</span>
                <Icon size={20} className={stat.color} />
              </div>
              <span className="text-3xl font-bold">{stat.value}</span>
            </Card>
          )
        })}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/projects/new" className="card hover:bg-[rgba(255,255,255,0.02)] flex items-center gap-4 transition-colors">
            <div className="w-12 h-12 rounded-full bg-[rgba(108,99,255,0.1)] text-[var(--color-accent)] flex items-center justify-center">
              <FolderKanban size={24} />
            </div>
            <div>
              <h3 className="font-semibold">Create New Project</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Start planning your next big thing</p>
            </div>
          </Link>
          <Link href="/projects" className="card hover:bg-[rgba(255,255,255,0.02)] flex items-center gap-4 transition-colors">
            <div className="w-12 h-12 rounded-full bg-[rgba(34,197,94,0.1)] text-[var(--color-success)] flex items-center justify-center">
              <CheckSquare size={24} />
            </div>
            <div>
              <h3 className="font-semibold">View All Projects</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Manage your existing work</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
