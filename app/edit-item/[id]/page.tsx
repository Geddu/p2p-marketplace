"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ItemForm } from "@/components/items/ItemForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditItemPage() {
  const { id } = useParams();

  const { data: item, isLoading } = useQuery({
    queryKey: ["item", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching item:", error);
        return null;
      }

      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Item not found</p>
      </div>
    );
  }

  return <ItemForm mode="edit" initialData={item} />;
}
