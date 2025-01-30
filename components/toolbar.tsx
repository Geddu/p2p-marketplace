"use client"

import { Home, Package, MessageCircle, User, Gift } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/lib/AuthContext"

const navItems = [
  { icon: Home, label: "home", href: "/" },
  { icon: Package, label: "myItems", href: "/my-items" },
  { icon: MessageCircle, label: "chats", href: "/chats" },
  { icon: Gift, label: "invites", href: "/invites" },
  { icon: User, label: "profile", href: "/profile" },
]

export function Toolbar() {
  const pathname = usePathname()
  const { t } = useTranslation()
  const { user } = useAuth()

  if (!user) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t md:top-0 md:bottom-auto">
      <div className="container flex justify-between items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full h-full text-sm transition-colors duration-200 ${
              pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-primary"
            }`}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span>{t(item.label)}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

