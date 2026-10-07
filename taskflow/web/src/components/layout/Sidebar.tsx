'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import apiClient from '@/lib/apiClient'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      await apiClient.post('/auth/logout', { refreshToken })
    } catch (e) {
      console.error(e)
    } finally {
      localStorage.removeItem('refreshToken')
      logout()
      window.location.href = '/login'
    }
  }

  return (
    <div className="w-64 border-r border-[var(--color-border)] h-screen flex flex-col bg-[var(--color-surface)] p-4 fixed left-0 top-0">
      <div className="flex items-center gap-2 px-2 mb-8 mt-2">
        <CheckSquare className="text-[var(--color-accent)]" size={28} />
        <span className="text-xl font-bold tracking-tight">TaskFlow</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-text-muted)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--color-text)]'
              }`}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="pt-4 border-t border-[var(--color-border)]">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium truncate">{user?.full_name}</p>
          <p className="text-xs text-[var(--color-text-muted)] truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg font-medium text-[var(--color-text-muted)] hover:bg-[rgba(239,68,68,0.1)] hover:text-[var(--color-error)] transition-colors"
        >
          <LogOut size={20} />
          Log Out
        </button>
      </div>
    </div>
  )
}
