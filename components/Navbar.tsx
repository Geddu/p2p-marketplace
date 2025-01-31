"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import {
  Home,
  Package,
  MessageCircle,
  User as UserIcon,
  Gift,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";

const navItems = [
  { icon: Home, label: "home", href: "/" },
  { icon: Package, label: "myItems", href: "/my-items" },
  { icon: MessageCircle, label: "chats", href: "/chats" },
  { icon: Gift, label: "invites", href: "/invites" },
  { icon: UserIcon, label: "profile", href: "/profile" },
];

function NavbarLoading() {
  return (
    <nav className="md:border-b fixed md:relative bottom-0 left-0 right-0 bg-background border-t md:border-t-0 z-50">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="mx-auto flex w-full md:w-auto items-center justify-around md:justify-start md:space-x-6">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col md:flex-row items-center md:gap-2 text-sm py-1"
            >
              <Skeleton className="h-6 w-6 md:h-4 md:w-4" />
              <Skeleton className="h-4 w-16 mt-1 md:mt-0" />
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <NavbarLoading />;
  }

  return (
    <nav className="md:border-b fixed md:relative bottom-0 left-0 right-0 bg-background border-t md:border-t-0 z-50">
      <div className="container mx-auto flex h-16 items-center px-4">
        {user ? (
          <div className="mx-auto flex w-full md:w-auto items-center justify-around md:justify-start md:space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col md:flex-row items-center md:gap-2 text-sm transition-colors duration-200 py-1 ${
                  pathname === item.href
                    ? "text-orange-500 font-medium"
                    : "text-muted-foreground hover:text-orange-500"
                }`}
              >
                <item.icon className="h-6 w-6 md:h-4 md:w-4" />
                <span className="text-xs md:text-sm mt-1 md:mt-0">
                  {t(item.label)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="ml-auto">
            <Link href="/auth">
              <Button
                variant={pathname === "/auth" ? "default" : "ghost"}
                className="text-lg md:text-base"
              >
                Sign In
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
