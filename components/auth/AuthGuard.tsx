"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push("/auth");
          return;
        }

        // Check if profile exists
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", session.user.id)
          .single();

        if (!profile) {
          // Create profile if it doesn't exist
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: uuidv4(),
              user_id: session.user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (profileError) {
            console.error("Error creating profile:", profileError);
            toast.error(t("errorCreatingProfile"));
            router.push("/auth");
            return;
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/auth");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndProfile();
  }, [router, t]);

  if (isLoading) {
    return <div>Loading...</div>; // You might want to use a proper loading component
  }

  return <>{children}</>;
}
