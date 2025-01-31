"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  Heart,
  MessageCircle,
  DollarSign,
  Star,
  MapPin,
  Calendar,
  Eye,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel } from "@/components/carousel";
import { ChatDrawer } from "@/components/chat-drawer";
import { supabase, getAuthenticatedImageUrl } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ItemCarousel } from "@/components/item-carousel";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  reputation_score: number | null;
  user_id: string;
}

interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  category: string;
  quality: string;
  location: string;
  views: number;
  favorites: number;
  conversations: number;
  created_at: string;
  user_id: string;
  images: string[];
  main_image: string | null;
  seller?: Profile;
}

export default function ItemPage() {
  const { id } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const router = useRouter();
  const { t } = useTranslation();

  const { data: item, isLoading } = useQuery<Item | null>({
    queryKey: ["item", id],
    queryFn: async () => {
      // First, fetch the item
      const { data: fetchedItem, error } = await supabase
        .from("items")
        .select(
          `
          id,
          title,
          description,
          price,
          status,
          category,
          quality,
          location,
          views,
          favorites,
          conversations,
          created_at,
          user_id,
          images,
          main_image
        `
        )
        .eq("id", id)
        .single();

      if (error || !fetchedItem) {
        console.error("Error fetching item:", error);
        return null;
      }

      const item = fetchedItem as Item;

      // Then fetch the seller's profile
      const { data: sellerProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, reputation_score, user_id")
        .eq("user_id", item.user_id)
        .single();

      if (profileError) {
        console.error("Error fetching seller profile:", profileError);
      } else if (sellerProfile) {
        item.seller = sellerProfile as Profile;
      }

      console.log("Fetched item:", item);
      console.log("Seller data:", item.seller);

      // Increment view count
      await supabase
        .from("items")
        .update({ views: (item.views || 0) + 1 })
        .eq("id", id);

      return item;
    },
  });

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    },
  });

  useEffect(() => {
    if (session && item) {
      // Check if item is in user's favorites
      const checkFavorite = async () => {
        // First get the user's profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", session.user.id)
          .single();

        if (profileError || !profile) {
          console.error("Error getting user profile:", profileError);
          return;
        }

        const { data, error } = await supabase
          .from("favorites")
          .select("id")
          .eq("item_id", id)
          .eq("user_id", profile.id)
          .maybeSingle();

        if (error) {
          console.error("Error checking favorites:", error);
          return;
        }

        setIsFavorite(!!data);
      };
      checkFavorite();
    }
  }, [session, id, item]);

  useEffect(() => {
    const loadImageUrls = async () => {
      console.log("Loading image URLs for item:", item);
      if (item?.images) {
        console.log("Found images array:", item.images);
        try {
          const urls = await Promise.all(
            item.images.map(async (image: string) => {
              console.log("Processing image:", image);
              const url = await getAuthenticatedImageUrl(image);
              console.log("Got URL for image:", url);
              return url || "";
            })
          );
          const filteredUrls = urls.filter((url) => url !== "");
          console.log("Final image URLs:", filteredUrls);
          setImageUrls(filteredUrls);
        } catch (error) {
          console.error("Error loading image URLs:", error);
        }
      } else {
        console.log("No images found for item");
      }
    };
    loadImageUrls();
  }, [item?.images]);

  const toggleFavorite = async () => {
    if (!session) {
      toast.error(t("pleaseSignInToFavorite"));
      return;
    }

    if (!item) {
      toast.error(t("itemNotFound"));
      return;
    }

    try {
      // Get user's profile first
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, user_id")
        .eq("user_id", session.user.id)
        .single();

      if (profileError || !profile) {
        console.error("Error getting user profile:", profileError);
        toast.error(t("errorTogglingFavorite"));
        return;
      }

      console.log("Found profile:", profile);
      console.log("Session user:", session.user);
      console.log("Attempting to toggle favorite with:", {
        item_id: id,
        user_id: profile.id,
        isFavorite,
      });

      if (isFavorite) {
        const { data: deleteData, error: deleteError } = await supabase
          .from("favorites")
          .delete()
          .eq("item_id", id)
          .eq("user_id", profile.id);

        if (deleteError) {
          console.error("Error deleting favorite:", deleteError);
          toast.error(t("errorTogglingFavorite"));
          return;
        }

        console.log("Successfully deleted favorite:", deleteData);

        const { error: updateError } = await supabase
          .from("items")
          .update({ favorites: Math.max(0, item.favorites - 1) })
          .eq("id", id);

        if (updateError) {
          console.error("Error updating item favorites count:", updateError);
        }
      } else {
        // Debug: First check if we can select from profiles with our conditions
        const { data: checkData, error: checkError } = await supabase.rpc(
          "check_profile_access",
          { profile_id: profile.id }
        );
        console.log("Profile access check:", { checkData, checkError });

        // Additional debug info
        const { data: debugData, error: debugError } = await supabase.rpc(
          "debug_favorite_access",
          { test_user_id: profile.id }
        );
        console.log("Debug access info:", { debugData, debugError });

        const { data: insertData, error: insertError } = await supabase
          .from("favorites")
          .insert([
            {
              item_id: id,
              user_id: profile.id,
            },
          ])
          .select();

        if (insertError) {
          console.error("Error inserting favorite:", insertError);
          toast.error(t("errorTogglingFavorite"));
          return;
        }

        console.log("Successfully inserted favorite:", insertData);

        const { error: updateError } = await supabase
          .from("items")
          .update({ favorites: (item.favorites || 0) + 1 })
          .eq("id", id);

        if (updateError) {
          console.error("Error updating item favorites count:", updateError);
        }
      }

      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error(t("errorTogglingFavorite"));
    }
  };

  const openChat = () => {
    if (!session) {
      toast.error(t("pleaseSignInToChat"));
      return;
    }
    setIsChatOpen(true);
  };

  const requestToBuy = async () => {
    if (!session) {
      toast.error(t("pleaseSignInToBuy"));
      return;
    }

    try {
      // Get user's profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (!profile) {
        toast.error(t("profileNotFound"));
        return;
      }

      // Check if item is still available
      const { data: currentItem } = await supabase
        .from("items")
        .select("status")
        .eq("id", id)
        .single();

      if (!currentItem || currentItem.status !== "available") {
        toast.error(t("itemNoLongerAvailable"));
        return;
      }

      // Create a purchase request
      const { error: requestError } = await supabase
        .from("purchase_requests")
        .insert({
          item_id: id,
          buyer_id: profile.id,
          status: "pending",
        });

      if (requestError) {
        console.error("Error creating purchase request:", requestError);
        toast.error(t("errorCreatingRequest"));
        return;
      }

      toast.success(t("purchaseRequestSent"));
      openChat(); // Open chat to discuss the purchase
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("unexpectedError"));
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">{t("itemNotFound")}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <ItemCarousel images={imageUrls} />
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" /> {item.views || 0}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" /> {item.favorites || 0}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" /> {item.conversations || 0}
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />{" "}
              {new Date(item.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">{item.title}</h1>
              <Button variant="ghost" size="icon" onClick={toggleFavorite}>
                <Heart
                  className={`h-6 w-6 ${
                    isFavorite ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-2xl font-semibold">${item.price}</p>
              <Badge
                variant={
                  item.status === "available"
                    ? "default"
                    : item.status === "pending"
                    ? "outline"
                    : "secondary"
                }
                className={
                  item.status === "available"
                    ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                    : item.status === "pending"
                    ? "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                    : ""
                }
              >
                {t(item.status)}
              </Badge>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{t("seller")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={item.seller?.avatar_url || ""} />
                  <AvatarFallback>
                    {item.seller?.full_name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {item.seller?.full_name || t("unknownSeller")}
                  </p>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>
                      {item.seller?.reputation_score?.toFixed(1) || "5.0"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">{t("description")}</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {item.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">{t("category")}</p>
                <Badge variant="secondary">{item.category}</Badge>
              </div>
              <div>
                <p className="font-semibold">{t("quality")}</p>
                <Badge variant="secondary">{item.quality}</Badge>
              </div>
              <div className="col-span-2">
                <p className="font-semibold">{t("location")}</p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {item.location}
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="default" className="flex-1" onClick={openChat}>
                <MessageCircle className="mr-2 h-4 w-4" /> {t("contactSeller")}
              </Button>
              <Button
                variant="default"
                className="flex-1"
                onClick={requestToBuy}
                disabled={item.status !== "available"}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                {item.status === "available"
                  ? t("requestToBuy")
                  : t("itemNotAvailable")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        itemTitle={item?.title || ""}
        otherPartyName={item?.seller?.full_name || t("unknownSeller")}
      />
    </div>
  );
}
