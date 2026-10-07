'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import apiClient from '@/lib/apiClient'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, setAccessToken } = useAuthStore()

  useEffect(() => {
    const initAuth = async () => {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        setLoading(false)
        return
      }

      try {
        // Attempt to refresh the token on app load
        const { data } = await apiClient.post('/auth/refresh', { refreshToken })
        const newAccessToken = data.data.accessToken
        const newRefreshToken = data.data.refreshToken
        
        localStorage.setItem('refreshToken', newRefreshToken)
        setAccessToken(newAccessToken)

        // Fetch user profile
        const meRes = await apiClient.get('/auth/me')
        setUser(meRes.data.data)
      } catch (error) {
        console.error('Failed to initialize auth', error)
        localStorage.removeItem('refreshToken')
        setUser(null)
        setAccessToken(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  return <>{children}</>
}
