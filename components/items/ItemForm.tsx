"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageUpload } from "./ImageUpload";
import { v4 as uuidv4 } from "uuid";

const formSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(50, "Title must be less than 50 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  category: z.string().min(1, "Please select a category"),
  price: z.string().min(1, "Please enter a price"),
  quality: z.string().min(1, "Please select item quality"),
  location: z.string().min(1, "Please enter a location"),
  images: z
    .array(z.string())
    .min(1, "Please upload at least one image")
    .max(3, "Maximum 3 images allowed"),
  main_image: z.string().optional(),
});

interface ItemFormProps {
  initialData?: z.infer<typeof formSchema> & { id: string };
  mode: "create" | "edit";
}

export function ItemForm({ initialData, mode }: ItemFormProps) {
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [mainImage, setMainImage] = useState<string | undefined>(
    initialData?.main_image
  );
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      category: "",
      price: "",
      quality: "",
      location: "",
      images: [],
      main_image: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error(t("pleaseSignIn"));
        router.push("/auth");
        return;
      }

      console.log("Checking profile for user:", session.user.id);

      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*") // Select all fields to see what we get back
        .eq("user_id", session.user.id)
        .single();

      console.log("Profile query result:", { profile, profileError });

      if (profileError) {
        console.error("Profile error:", profileError);
        toast.error(t("errorNoProfile"));
        return;
      }

      if (!profile) {
        console.error("No profile found for user:", session.user.id);
        toast.error(t("errorNoProfile"));
        return;
      }

      console.log("Found profile:", profile);

      if (mode === "create") {
        const insertData = {
          ...values,
          user_id: session.user.id,
          status: "available",
          views: 0,
          favorites: 0,
          conversations: 0,
        };

        console.log("Attempting to insert item with data:", insertData);

        // Insert new item
        const { error: insertError } = await supabase
          .from("items")
          .insert(insertData);

        if (insertError) {
          console.error("Error adding item:", insertError);
          toast.error(t("errorAddingItem"));
          return;
        }

        toast.success(t("itemAddedSuccessfully"));
      } else {
        // Update existing item
        const { error: updateError } = await supabase
          .from("items")
          .update(values)
          .eq("id", initialData?.id)
          .eq("user_id", session.user.id);

        if (updateError) {
          console.error("Error updating item:", updateError);
          toast.error(t("errorUpdatingItem"));
          return;
        }

        toast.success(t("itemUpdatedSuccessfully"));
      }

      router.push("/my-items");
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error(t("unexpectedError"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {mode === "create" ? t("addNewItem") : t("editItem")}
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("images")}</FormLabel>
                <FormControl>
                  <ImageUpload
                    itemId={initialData?.id || "new"}
                    onChange={(urls, newMainImage) => {
                      setImages(urls);
                      field.onChange(urls);
                      if (newMainImage !== undefined) {
                        setMainImage(newMainImage);
                        form.setValue("main_image", newMainImage);
                      }
                    }}
                    images={field.value}
                    mainImage={form.watch("main_image")}
                    maxImages={3}
                  />
                </FormControl>
                <FormDescription>
                  {t("uploadImagesDescription")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("title")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("enterItemTitle")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("description")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("describeYourItem")}
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("category")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectCategory")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="electronics">
                      {t("electronics")}
                    </SelectItem>
                    <SelectItem value="fashion">{t("fashion")}</SelectItem>
                    <SelectItem value="home">{t("homeAndGarden")}</SelectItem>
                    <SelectItem value="sports">
                      {t("sportsAndOutdoors")}
                    </SelectItem>
                    <SelectItem value="other">{t("other")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("price")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={t("enterPrice")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("quality")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectItemQuality")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="new">{t("new")}</SelectItem>
                    <SelectItem value="like-new">{t("likeNew")}</SelectItem>
                    <SelectItem value="good">{t("good")}</SelectItem>
                    <SelectItem value="fair">{t("fair")}</SelectItem>
                    <SelectItem value="poor">{t("poor")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("location")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("enterItemLocation")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? mode === "create"
                ? t("adding")
                : t("saving")
              : mode === "create"
              ? t("addItem")
              : t("saveChanges")}
          </Button>
        </form>
      </Form>
    </div>
  );
}
