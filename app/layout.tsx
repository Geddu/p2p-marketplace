import { Inter } from "next/font/google"
import "./globals.css"
import dynamic from "next/dynamic"

const inter = Inter({ subsets: ["latin"] })

const DynamicProviders = dynamic(() => import("@/components/DynamicProviders"), { ssr: false })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DynamicProviders>{children}</DynamicProviders>
      </body>
    </html>
  )
}

