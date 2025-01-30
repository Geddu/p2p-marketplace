"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { I18nextProvider } from "react-i18next"
import i18n from "@/lib/i18n"
import { AuthProvider } from "@/lib/AuthContext"
import { Toaster } from "sonner"
import dynamic from "next/dynamic"

const DynamicAppContent = dynamic(() => import("@/components/AppContent"), { ssr: false })

export default function DynamicProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <AuthProvider>
          <DynamicAppContent>{children}</DynamicAppContent>
          <Toaster position="top-center" />
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  )
}

