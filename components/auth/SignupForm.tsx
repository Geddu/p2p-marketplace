"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  Loader2,
  ClipboardPaste,
  Mail,
  Lock,
  User,
  Ticket,
} from "lucide-react";

export default function SignupForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isVerificationSent, setIsVerificationSent] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInviteCode(text.trim().toUpperCase());
      toast.success(t("codePasted"));
    } catch (err) {
      toast.error(t("clipboardError"));
    }
  };

  const openGmail = () => {
    // Check if it's a mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Open Gmail app on mobile
      window.location.href = "googlegmail://";
    } else {
      // Open Gmail in a new tab on desktop
      window.open("https://gmail.com", "_blank");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const normalizedCode = inviteCode.trim().toUpperCase();
      console.log("Attempting to verify invite code:", normalizedCode);

      // Validate invite code
      const { data: invites, error: inviteError } = await supabase
        .from("invites")
        .select("id, inviter_id, status, expires_at")
        .eq("code", normalizedCode)
        .eq("status", "pending")
        .single();

      console.log("Checking invite code:", normalizedCode);
      console.log("Found invite:", invites);

      if (inviteError) {
        console.error("Invite error:", inviteError);
        if (inviteError.code === "PGRST116") {
          toast.error(t("invalidInviteCode"));
        } else {
          throw inviteError;
        }
        setIsLoading(false);
        return;
      }

      const invite = invites;

      if (new Date(invite.expires_at) < new Date()) {
        toast.error(t("inviteExpired"));
        setIsLoading(false);
        return;
      }

      // Create the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              invite_code: normalizedCode,
            },
          },
        }
      );

      if (signUpError) throw signUpError;

      if (!authData.user) {
        toast.error(t("failedToCreateUser"));
        return;
      }

      // Accept the invite using the secure function
      const { data: acceptResult, error: acceptError } = await supabase.rpc(
        "accept_invite",
        {
          p_invite_id: invite.id,
          p_user_id: authData.user.id,
        }
      );

      if (acceptError) {
        console.error("Failed to accept invite:", acceptError);
        throw acceptError;
      }

      if (!acceptResult) {
        toast.error(t("failedToAcceptInvite"));
        return;
      }

      // Create or update the user's profile using upsert
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          user_id: authData.user.id,
          full_name: fullName,
          invites_left: 3, // Default number of invites
          invited_by_id: invite.inviter_id, // Track who invited this user
        },
        {
          onConflict: "user_id",
          ignoreDuplicates: false,
        }
      );

      if (profileError) {
        console.error("Profile creation error:", profileError);
        throw profileError;
      }

      setIsVerificationSent(true);
      toast.success(t("accountCreated"));
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(t("failedToCreateAccount"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerificationSent) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold tracking-tight">
            {t("checkEmail")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("verificationSent")} {email}
          </p>
        </div>
        <div className="space-y-2">
          <Button className="w-full" onClick={openGmail}>
            <Mail className="mr-2 h-4 w-4" />
            {t("openGmail")}
          </Button>
          <p className="text-sm text-muted-foreground">{t("verifyToLogin")}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isVerificationSent && (
        <div className="space-y-2 pb-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t("createAccount")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("joinCommunity")}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="invite">{t("inviteCode")}</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Ticket className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="invite"
                placeholder={t("enterInviteCode")}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                required
                className="pl-10 uppercase"
                disabled={isLoading}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handlePaste}
              disabled={isLoading}
              className="shrink-0"
            >
              <ClipboardPaste className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">{t("fullName")}</Label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="fullName"
              placeholder={t("enterFullName")}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={isLoading}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder={t("enterEmail")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t("password")}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder={t("enterPassword")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={8}
              className="pl-10"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {t("passwordRequirement")}
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("signingUp")}
            </>
          ) : (
            t("signUp")
          )}
        </Button>
      </form>
    </>
  );
}
