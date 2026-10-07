'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Search, Plus, Calendar } from 'lucide-react'
import apiClient from '@/lib/apiClient'
import { format } from 'date-fns'

interface Project {
  id: string
  name: string
  description: string | null
  status: 'not_started' | 'in_progress' | 'completed'
  end_date: string | null
  created_at: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchProjects()
  }, [search, statusFilter])

  const fetchProjects = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const { data } = await apiClient.get(`/projects?${params.toString()}`)
      setProjects(data.data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="success">Completed</Badge>
      case 'in_progress': return <Badge variant="warning">In Progress</Badge>
      default: return <Badge variant="neutral">Not Started</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-[var(--color-text-muted)]">Manage your projects and tasks</p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus size={18} /> New Project
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field w-full pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field bg-[var(--color-surface)] sm:w-48"
        >
          <option value="all">All Statuses</option>
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-48 animate-pulse bg-[rgba(255,255,255,0.05)]" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[var(--color-border)] rounded-2xl">
          <FolderKanban className="mx-auto text-[var(--color-text-muted)] mb-4" size={48} />
          <h3 className="text-xl font-semibold mb-2">No projects found</h3>
          <p className="text-[var(--color-text-muted)] mb-6">Get started by creating your first project.</p>
          <Link href="/projects/new">
            <Button><Plus size={18} /> Create Project</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="h-full flex flex-col hover:-translate-y-1 hover:border-[var(--color-accent)] cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-[var(--color-accent)] transition-colors">
                    {project.name}
                  </h3>
                  {getStatusBadge(project.status)}
                </div>
                <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mb-auto">
                  {project.description || 'No description provided.'}
                </p>
                <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex items-center text-sm text-[var(--color-text-muted)]">
                  <Calendar size={14} className="mr-2" />
                  {project.end_date ? `Due ${format(new Date(project.end_date), 'MMM d, yyyy')}` : 'No due date'}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
// Temporary import fix for the icon in empty state
import { FolderKanban } from 'lucide-react'
