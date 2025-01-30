"use client"

import { useAuth } from "@/lib/AuthContext"
import { Toolbar } from "@/components/toolbar"
import AuthPage from "@/app/auth/page"

export default function AppContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  if (!user) {
    return <AuthPage />
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow mx-4 my-8 px-2 sm:px-4 rounded-xl shadow-lg overflow-hidden">
        <div className="pb-16 md:pb-0 md:pt-16">{children}</div>
      </main>
      <Toolbar />
    </div>
  )
}

