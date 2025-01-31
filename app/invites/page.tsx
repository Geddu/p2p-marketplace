"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase, type Profile } from "@/lib/supabase";
import InvitesList from "@/components/invites/InvitesList";
import CreateInviteForm from "@/components/invites/CreateInviteForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

async function getProfile() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  if (error) throw error;
  return data as Profile;
}

export default function InvitesPage() {
  const router = useRouter();
  const { t } = useTranslation();

  // Check authentication
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/auth");
      }
    });
  }, [router]);

  // Fetch profile data
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  if (isLoadingProfile) {
    return (
      <div className="container mx-auto py-10 text-center">{t("loading")}</div>
    );
  }

  if (!profile) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("inviteManagement")}</CardTitle>
          <CardDescription>
            {t("invitesRemaining", { count: profile.invites_left })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CreateInviteForm invitesLeft={profile.invites_left} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("yourInvites")}</CardTitle>
          <CardDescription>{t("trackInvites")}</CardDescription>
        </CardHeader>
        <CardContent>
          <InvitesList />
        </CardContent>
      </Card>
    </div>
  );
}
