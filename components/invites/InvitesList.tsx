"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Invite } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CopyIcon, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export default function InvitesList() {
  const { data: invites, isLoading } = useQuery({
    queryKey: ["invites"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      const { data, error } = await supabase
        .from("invites")
        .select(
          `
          *,
          accepted_profile:profiles!invites_accepted_profile_id_fkey (
            full_name,
            avatar_url
          )
        `
        )
        .eq("inviter_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Invite[];
    },
  });

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  const getStatusIcon = (invite: Invite) => {
    const isExpired = new Date(invite.expires_at) < new Date();
    if (isExpired) return <XCircle className="w-4 h-4 text-red-500" />;
    if (invite.status === "accepted")
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <Clock className="w-4 h-4 text-yellow-500" />;
  };

  const getStatusText = (invite: Invite) => {
    const isExpired = new Date(invite.expires_at) < new Date();
    if (isExpired) return "Expired";
    if (invite.status === "accepted") {
      return `Accepted by ${invite.accepted_profile?.full_name || "Unknown"}`;
    }
    return "Pending";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!invites?.length) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No invites generated yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invites.map((invite) => (
        <div
          key={invite.id}
          className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {getStatusIcon(invite)}
                <span className="font-medium">{getStatusText(invite)}</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="px-2 py-1 bg-muted rounded text-sm">
                  {invite.code}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(invite.code)}
                >
                  <CopyIcon className="w-4 h-4" />
                </Button>
              </div>
              {invite.email && (
                <p className="text-sm text-muted-foreground">
                  Sent to: {invite.email}
                </p>
              )}
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>Created: {format(new Date(invite.created_at), "PP")}</p>
              <p>Expires: {format(new Date(invite.expires_at), "PP")}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
