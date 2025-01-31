"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Heart, MessageCircle, MapPin, Edit } from "lucide-react";
import { ChatDrawer } from "@/components/chat-drawer";
import { useTranslation } from "react-i18next";
import { supabase, getAuthenticatedImageUrl } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

interface UserItem {
  id: number;
  title: string;
  price: number;
  quality: string;
  location: string;
  images: string[];
  views: number;
  favorites: number;
  conversations: number;
}

export function UserItemList() {
  const [activeChat, setActiveChat] = useState<UserItem | null>(null);
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});
  const { t } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchUserItems() {
      if (user) {
        const { data, error } = await supabase
          .from("items")
          .select("*")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching user items:", error);
        } else {
          setUserItems(data || []);
          const urls: { [key: string]: string } = {};
          for (const item of data || []) {
            if (item.images && item.images.length > 0) {
              const imagePath = item.images[0];
              const isFullUrl =
                imagePath.startsWith("http://") ||
                imagePath.startsWith("https://");

              try {
                if (isFullUrl) {
                  const filename = imagePath.split("/").pop() || "";
                  const privatePath = `private/${filename}`;
                  const url = await getAuthenticatedImageUrl(privatePath);
                  if (url) {
                    urls[item.id] = url;
                  }
                } else {
                  const url = await getAuthenticatedImageUrl(imagePath);
                  if (url) {
                    urls[item.id] = url;
                  }
                }
              } catch (error) {
                console.error(
                  `Error processing image for item ${item.id}:`,
                  error
                );
              }
            }
          }
          setImageUrls(urls);
        }
      }
    }

    fetchUserItems();
  }, [user]);

  const openChat = (item: UserItem) => {
    setActiveChat(item);
  };

  return (
    <div className="space-y-4">
      {userItems.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="w-full sm:w-24 h-48 sm:h-24 relative">
                <Image
                  src={imageUrls[item.id] || "/placeholder.svg"}
                  alt={item.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                    console.error(
                      `Failed to load image for item ${item.id}:`,
                      item.images[0]
                    );
                  }}
                />
              </div>
              <div className="p-4 flex-grow w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-primary font-medium">${item.price}</p>
                  </div>
                  <Badge variant="secondary" className="mt-2 sm:mt-0">
                    {t(item.quality.toLowerCase())}
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-muted-foreground mt-2">
                  <span className="flex items-center mb-2 sm:mb-0">
                    <MapPin className="w-3 h-3 mr-1" /> {item.location}
                  </span>
                  <div className="flex space-x-3">
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" /> {item.views}
                    </span>
                    <span className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" /> {item.favorites}
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />{" "}
                      {item.conversations}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 flex justify-center sm:justify-end space-x-2 w-full sm:w-auto">
                <Link href={`/edit-item/${item.id}`}>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-10 h-10"
                  >
                    <Edit className="w-5 h-5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full w-10 h-10"
                  onClick={() => openChat(item)}
                >
                  <MessageCircle className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <ChatDrawer
        isOpen={!!activeChat}
        onClose={() => setActiveChat(null)}
        itemTitle={activeChat?.title || ""}
        otherPartyName={t("buyer")}
        chatId=""
      />
    </div>
  );
}
