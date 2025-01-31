"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CopyIcon, SendIcon, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface CreateInviteFormProps {
  invitesLeft: number;
}

export default function CreateInviteForm({
  invitesLeft,
}: CreateInviteFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const generateInviteCode = async () => {
    if (invitesLeft <= 0) {
      toast.error("No invites left!");
      return;
    }

    setIsLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (!profile) {
        toast.error("Profile not found");
        return;
      }

      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { error } = await supabase.from("invites").insert({
        code,
        email: email || null,
        inviter_id: profile.id,
        status: "pending",
        expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(), // 7 days
      });

      if (error) {
        if (error.code === "23505") {
          // Unique violation
          toast.error("This email has already been invited");
        } else {
          throw error;
        }
        return;
      }

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["invites"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      setGeneratedCode(code);
      toast.success("Invite code generated successfully!");

      if (email) {
        await sendInviteEmail(code);
      }
    } catch (error) {
      toast.error("Failed to generate invite code");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendInviteEmail = async (codeToSend: string) => {
    setIsSending(true);
    try {
      // Here you would integrate with your email service
      // For example, using a serverless function or API route
      const response = await fetch("/api/send-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: codeToSend,
        }),
      });

      if (!response.ok) throw new Error("Failed to send email");

      toast.success(`Invite sent to ${email}`);
      setEmail("");
    } catch (error) {
      console.error("Failed to send email:", error);
      toast.error("Failed to send email, but code was generated");
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = async () => {
    if (generatedCode) {
      try {
        await navigator.clipboard.writeText(generatedCode);
        toast.success("Code copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy code");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email (Optional)</Label>
        <Input
          id="email"
          type="email"
          placeholder="friend@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading || isSending}
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={generateInviteCode}
          disabled={isLoading || isSending || invitesLeft <= 0}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Invite Code"
          )}
        </Button>

        {generatedCode && (
          <>
            <Button variant="outline" onClick={copyToClipboard}>
              <CopyIcon className="w-4 h-4 mr-2" />
              Copy Code
            </Button>
            {email && (
              <Button
                variant="outline"
                onClick={() => sendInviteEmail(generatedCode)}
                disabled={isSending}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <SendIcon className="w-4 h-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </div>

      {generatedCode && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm font-mono">{generatedCode}</p>
        </div>
      )}

      {invitesLeft <= 2 && (
        <p className="text-sm text-yellow-600 dark:text-yellow-400">
          You have only {invitesLeft} invite{invitesLeft === 1 ? "" : "s"} left.
          Use it wisely!
        </p>
      )}
    </div>
  );
}
