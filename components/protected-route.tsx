"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Spinner } from "@/components/ui/spinner"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { usuario, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !usuario) {
      router.push("/login")
    }
  }, [usuario, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!usuario) {
    return null
  }

  return <>{children}</>
}
