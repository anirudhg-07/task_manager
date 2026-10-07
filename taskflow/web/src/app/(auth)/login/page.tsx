'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginSchema } from '@/schemas'
import { z } from 'zod'
import toast from 'react-hot-toast'
import apiClient from '@/lib/apiClient'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type LoginFormValues = z.infer<typeof LoginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { setUser, setAccessToken } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    try {
      const res = await apiClient.post('/auth/login', data)
      const { user, accessToken, refreshToken } = res.data.data

      localStorage.setItem('refreshToken', refreshToken)
      setAccessToken(accessToken)
      setUser(user)

      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card glass w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center">Welcome back</h1>
        <p className="text-center text-[var(--color-text-muted)] mb-8">
          Sign in to access your projects and tasks
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            error={errors.email?.message}
          />
          
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
          />

          <Button type="submit" isLoading={isLoading} className="w-full mt-4">
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-[var(--color-text-muted)]">Don't have an account? </span>
          <Link href="/register" className="text-[var(--color-accent)] hover:underline font-medium">
            Create one
          </Link>
        </div>
      </div>
    </div>
  )
}
