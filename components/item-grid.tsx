"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase, getAuthenticatedImageUrl } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

interface Item {
  id: number;
  title: string;
  price: number;
  quality: string;
  location: string;
  images: string[];
}

export function ItemGrid() {
  const [items, setItems] = useState<Item[]>([]);
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});
  const { t } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchItems() {
      const { data, error } = await supabase.from("items").select("*");

      if (error) {
        console.error("Error fetching items:", error);
      } else {
        setItems(data || []);
        if (user) {
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

    fetchItems();
  }, [user]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <Link key={item.id} href={`/item/${item.id}`}>
          <Card className="overflow-hidden transition-transform duration-200 hover:scale-105">
            <CardContent className="p-0">
              <div className="aspect-square relative">
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
              <div className="p-4 bg-background/80 backdrop-blur-sm">
                <h3 className="font-semibold truncate text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm text-primary font-medium mb-2">
                  ${item.price}
                </p>
                <div className="flex justify-between items-center">
                  <Badge variant="secondary">
                    {t(item.quality.toLowerCase())}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {item.location}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
