"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase, type Profile, type Invite } from "@/lib/supabase";
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

async function getInvites(profileId: string) {
  const { data, error } = await supabase
    .from("invites")
    .select(
      `
      *,
      accepted_profile:profiles(full_name, avatar_url)
    `
    )
    .eq("inviter_id", profileId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Invite[];
}

export default function InvitesPage() {
  const router = useRouter();

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

  // Fetch invites data
  const { data: invites, isLoading: isLoadingInvites } = useQuery({
    queryKey: ["invites", profile?.id],
    queryFn: () => (profile?.id ? getInvites(profile.id) : Promise.resolve([])),
    enabled: !!profile?.id,
  });

  if (isLoadingProfile || isLoadingInvites) {
    return (
      <div className="container mx-auto py-10 text-center">Loading...</div>
    );
  }

  if (!profile) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invite Management</CardTitle>
          <CardDescription>
            You have {profile.invites_left} invites remaining. Share them
            wisely!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CreateInviteForm invitesLeft={profile.invites_left} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Invites</CardTitle>
          <CardDescription>
            Track the status of your sent invites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InvitesList invites={invites || []} />
        </CardContent>
      </Card>
    </div>
  );
}
