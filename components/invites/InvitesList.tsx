"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  CopyIcon,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  TrendingDown,
  TrendingUp,
  Minus,
  Star,
  User,
  Percent,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";

interface InviteDetail {
  id: string;
  code: string;
  status: string;
  email: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
  inviter_id: string;
  inviter_name: string;
  inviter_reputation: number;
  invited_name: string | null;
  invited_reputation: number | null;
  reputation_effect: number | null;
}

export default function InvitesList() {
  const { t } = useTranslation();
  const { data: invites, isLoading } = useQuery({
    queryKey: ["invites"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("invite_details")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as InviteDetail[];
    },
  });

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(t("codeCopied"));
    } catch (err) {
      toast.error(t("copyFailed"));
    }
  };

  const getStatusIcon = (invite: InviteDetail) => {
    const isExpired = new Date(invite.expires_at) < new Date();
    if (isExpired) return <XCircle className="w-4 h-4 text-red-500" />;
    if (invite.status === "accepted")
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <Clock className="w-4 h-4 text-yellow-500" />;
  };

  const getStatusText = (invite: InviteDetail) => {
    const isExpired = new Date(invite.expires_at) < new Date();
    if (isExpired) return t("expired");
    if (invite.status === "accepted") {
      return t("accepted");
    }
    return t("pending");
  };

  const getReputationEffect = (invite: InviteDetail) => {
    if (!invite.reputation_effect) return null;

    if (invite.reputation_effect > 0) {
      return (
        <Badge
          variant="default"
          className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
        >
          <TrendingUp className="w-3 h-3 mr-1" />+
          {invite.reputation_effect.toFixed(2)} {t("reputationEffect")}
        </Badge>
      );
    } else if (invite.reputation_effect < 0) {
      return (
        <Badge
          variant="default"
          className="bg-red-500/10 text-red-500 hover:bg-red-500/20"
        >
          <TrendingDown className="w-3 h-3 mr-1" />
          {invite.reputation_effect.toFixed(2)} {t("reputationEffect")}
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary">
          <Minus className="w-3 h-3 mr-1" />
          {t("noReputationEffect")}
        </Badge>
      );
    }
  };

  // Calculate total discount from good invites
  const goodInvites =
    invites?.filter(
      (invite) =>
        invite.status === "accepted" &&
        invite.invited_reputation &&
        invite.invited_reputation > 3
    ) || [];
  const totalDiscount = goodInvites.length * 2;

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
        {t("noInvites")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {totalDiscount > 0 && (
        <div className="bg-green-500/10 text-green-700 dark:text-green-300 p-4 rounded-lg flex items-center gap-2 mb-6">
          <Percent className="w-5 h-5" />
          <div>
            <p className="font-medium">
              {t("totalDiscountTitle", { percent: totalDiscount })}
            </p>
            <p className="text-sm">
              {t("totalDiscountDesc", { count: goodInvites.length })}
            </p>
          </div>
        </div>
      )}

      {invites?.map((invite) => (
        <div
          key={invite.id}
          className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
        >
          <div className="flex flex-col space-y-4">
            {/* Status and Code Section */}
            <div className="flex items-start justify-between">
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
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>
                  {t("created")}: {format(new Date(invite.created_at), "PP")}
                </p>
                <p>
                  {t("expires")}: {format(new Date(invite.expires_at), "PP")}
                </p>
                {invite.accepted_at && (
                  <p>
                    {t("accepted")}:{" "}
                    {format(new Date(invite.accepted_at), "PP")}
                  </p>
                )}
              </div>
            </div>

            {/* Email Section */}
            {invite.email && (
              <div className="text-sm text-muted-foreground">
                {t("sentTo")}: {invite.email}
              </div>
            )}

            {/* Invited User Details Section */}
            {invite.status === "accepted" && invite.invited_name && (
              <div className="border-t pt-3 mt-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{invite.invited_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {t("reputation")}:{" "}
                        {invite.invited_reputation?.toFixed(2)}
                      </span>
                      {invite.invited_reputation &&
                        invite.invited_reputation > 3 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge
                                  variant="default"
                                  className="bg-green-500/10 text-green-500"
                                >
                                  <Percent className="w-3 h-3 mr-1" />
                                  {t("discountBadge")}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t("discountTooltip")}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                    </div>
                  </div>
                  <div>{getReputationEffect(invite)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
