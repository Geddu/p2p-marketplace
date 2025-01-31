"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
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
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInviteCode(text.trim().toUpperCase());
      toast.success("Code pasted from clipboard");
    } catch (err) {
      toast.error("Failed to read from clipboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate invite code
      const { data: invite, error: inviteError } = await supabase
        .from("invites")
        .select("id, inviter_id, status, expires_at")
        .eq("code", inviteCode.toUpperCase())
        .single();

      if (inviteError || !invite) {
        toast.error("Invalid invite code");
        return;
      }

      if (invite.status === "accepted") {
        toast.error("This invite code has already been used");
        return;
      }

      if (new Date(invite.expires_at) < new Date()) {
        toast.error("This invite code has expired");
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
              invite_code: inviteCode,
            },
          },
        }
      );

      if (signUpError) throw signUpError;

      if (!authData.user) {
        toast.error("Failed to create user");
        return;
      }

      // Create the user's profile
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: authData.user.id,
        full_name: fullName,
        invites_left: 3, // Default number of invites
      });

      if (profileError) throw profileError;

      // Update the invite status
      const { error: updateError } = await supabase
        .from("invites")
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString(),
          accepted_profile_id: authData.user.id,
        })
        .eq("id", invite.id);

      if (updateError) throw updateError;

      toast.success(
        "Account created successfully! Please check your email to verify your account."
      );
      router.push("/auth/verify");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="invite">Invite Code</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Ticket className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="invite"
              placeholder="Enter your invite code"
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
        <Label htmlFor="fullName">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            id="fullName"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={isLoading}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            minLength={8}
            className="pl-10"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Password must be at least 8 characters long
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
}
