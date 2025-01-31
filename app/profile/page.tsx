"use client";

import { useState, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Loader2, Mail, MapPin, Star } from "lucide-react";
import dynamic from "next/dynamic";

// Create a wrapper component for the chart
const ReputationChart = dynamic(
  () => import("@/components/charts/ReputationChart"),
  {
    ssr: false,
    loading: () => <div>Loading chart...</div>,
  }
);

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("info");
  const router = useRouter();
  const { t, i18n } = useTranslation();

  console.log("Rendering ProfilePage"); // Debug log

  // Fetch profile data
  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      console.log("Fetching profile data"); // Debug log
      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log("Session:", session); // Debug log

      if (!session) {
        console.log("No session found, redirecting to auth"); // Debug log
        router.push("/auth");
        return null;
      }

      // Try to get existing profile
      let { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(
          `
          id,
          user_id,
          full_name,
          avatar_url,
          invites_left,
          reputation_score,
          is_admin,
          created_at,
          reviews_received:reviews!reviews_reviewed_id_fkey(
            id,
            rating,
            comment,
            created_at,
            reviewer:profiles!reviews_reviewer_id_fkey(
              id,
              full_name,
              avatar_url
            )
          )
        `
        )
        .eq("user_id", session.user.id)
        .single();

      // If no profile exists, create one
      if (profileError?.code === "PGRST116") {
        console.log("No profile found, creating new profile"); // Debug log

        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert({
            user_id: session.user.id,
            full_name:
              session.user.user_metadata?.full_name ||
              session.user.email?.split("@")[0],
            invites_left: 3, // Default number of invites
            reputation_score: 5.0, // Default reputation score
            is_admin: false,
          })
          .select()
          .single();

        if (createError) {
          console.error("Error creating profile:", createError);
          throw createError;
        }

        profile = newProfile;
      } else if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }

      console.log("Profile data:", profile);
      return { ...profile, email: session.user.email };
    },
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // Calculate reputation data
  const reputationData = profile?.reviews_received?.length
    ? [
        {
          name: "Positive",
          value: profile.reviews_received.filter((r: any) => r.rating >= 4)
            .length,
          color: "#4ade80",
        },
        {
          name: "Neutral",
          value: profile.reviews_received.filter((r: any) => r.rating === 3)
            .length,
          color: "#facc15",
        },
        {
          name: "Negative",
          value: profile.reviews_received.filter((r: any) => r.rating < 3)
            .length,
          color: "#f87171",
        },
      ]
    : [
        {
          name: "No Reviews",
          value: 1,
          color: "#4ade80",
        },
      ];

  // Debug logs
  console.log("isLoading:", isLoading);
  console.log("error:", error);
  console.log("profile:", profile);

  if (error) {
    console.error("Error in profile page:", error);
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">Error loading profile: {error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    console.log("No profile data available"); // Debug log
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">No profile data available</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="w-24 h-24">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback>{profile.full_name?.[0] || "?"}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{profile.full_name}</h1>
          <div className="flex items-center text-muted-foreground">
            <Mail className="mr-2 h-4 w-4" />
            <span>{profile.email}</span>
          </div>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t("reputation")}</CardTitle>
          <CardDescription>
            {profile.reviews_received?.length
              ? t("reputationDescription")
              : t("noReviewsYet")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Suspense fallback={<div>Loading chart...</div>}>
            <div className="w-32 h-32">
              <ReputationChart data={reputationData} />
            </div>
          </Suspense>
          <div>
            {profile.reviews_received?.length ? (
              reputationData.map((entry) => (
                <p key={entry.name} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  {t(entry.name.toLowerCase())}: {entry.value}
                </p>
              ))
            ) : (
              <p className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "#4ade80" }}
                />
                {t("noReviewsYet")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="info">{t("personalInfo")}</TabsTrigger>
          <TabsTrigger value="reviews">{t("reviews")}</TabsTrigger>
          <TabsTrigger value="settings">{t("settings")}</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>{t("personalInformation")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {t("memberSince")}
                  </p>
                  <p>{new Date(profile.created_at).toLocaleDateString()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {t("invitesLeft")}
                  </p>
                  <p>{profile.invites_left}</p>
                </div>
                {profile.reputation_score && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {t("rating")}
                    </p>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-orange-500" />
                      <span>{profile.reputation_score.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>{t("reviews")}</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.reviews_received?.length ? (
                <div className="space-y-4">
                  {profile.reviews_received.map((review: any) => (
                    <div
                      key={review.id}
                      className="flex items-start gap-4 p-4 border rounded-lg"
                    >
                      <Avatar>
                        <AvatarImage src={review.reviewer.avatar_url} />
                        <AvatarFallback>
                          {review.reviewer.full_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {review.reviewer.full_name}
                          </span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-orange-500" />
                            <span className="ml-1">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-muted-foreground mt-1">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">{t("noReviewsYet")}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>{t("darkMode")}</span>
                  <ThemeToggle />
                </div>
                <div className="flex items-center justify-between">
                  <span>{t("language")}</span>
                  <Select
                    onValueChange={changeLanguage}
                    defaultValue={i18n.language}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fi">Suomi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="destructive"
                  className="w-full mt-8"
                  onClick={handleSignOut}
                >
                  {t("signOut")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
