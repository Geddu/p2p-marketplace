"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Loader2,
  X,
  Upload,
  Image as ImageIcon,
  Star,
  StarOff,
} from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

interface ImageUploadProps {
  itemId: string;
  images: string[];
  mainImage?: string;
  onChange: (images: string[], mainImage?: string) => void;
  maxImages?: number;
}

export function ImageUpload({
  itemId,
  images,
  mainImage,
  onChange,
  maxImages = 3,
}: ImageUploadProps) {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingUrls, setIsLoadingUrls] = useState(true);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (images.length + acceptedFiles.length > maxImages) {
        toast.error(t("tooManyImages", { count: maxImages }));
        return;
      }

      setIsUploading(true);
      try {
        const newImages = [...images];
        let newMainImage = mainImage;

        for (const file of acceptedFiles) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${itemId}/${Date.now()}.${fileExt}`;

          console.log("Uploading to bucket items-images with path:", fileName);

          const { data, error: uploadError } = await supabase.storage
            .from("items-images")
            .upload(fileName, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) {
            console.error("Upload error:", uploadError);
            throw uploadError;
          }

          newImages.push(fileName);
          // If this is the first image, make it the main image
          if (!newMainImage) {
            newMainImage = fileName;
          }
        }

        onChange(newImages, newMainImage);
        toast.success(t("imagesUploaded"));
      } catch (error: any) {
        console.error("Error uploading images:", error);
        toast.error(error?.message || t("errorUploadingImages"));
      } finally {
        setIsUploading(false);
      }
    },
    [itemId, images, maxImages, onChange, t, mainImage]
  );

  const removeImage = async (imageToRemove: string) => {
    try {
      const { error } = await supabase.storage
        .from("items-images")
        .remove([imageToRemove]);

      if (error) throw error;

      const updatedImages = images.filter((img) => img !== imageToRemove);
      let updatedMainImage = mainImage;

      // If we're removing the main image, set the first remaining image as main
      if (mainImage === imageToRemove) {
        updatedMainImage =
          updatedImages.length > 0 ? updatedImages[0] : undefined;
      }

      onChange(updatedImages, updatedMainImage);
      toast.success(t("imageRemoved"));
    } catch (error: any) {
      console.error("Error removing image:", error);
      toast.error(error?.message || t("errorRemovingImage"));
    }
  };

  const setAsMainImage = (image: string) => {
    onChange(images, image);
    toast.success(t("mainImageSet"));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: isUploading || images.length >= maxImages,
  });

  useEffect(() => {
    let mounted = true;
    setIsLoadingUrls(true);

    const loadSignedUrls = async () => {
      const newSignedUrls: Record<string, string> = {};

      for (const image of images) {
        const { data, error } = await supabase.storage
          .from("items-images")
          .createSignedUrl(image, 3600);

        if (data?.signedUrl && mounted) {
          newSignedUrls[image] = data.signedUrl;
        }
      }

      if (mounted) {
        setSignedUrls(newSignedUrls);
        setIsLoadingUrls(false);
      }
    };

    loadSignedUrls();
    return () => {
      mounted = false;
    };
  }, [images]);

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors
          ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary"
          }
          ${isUploading || images.length >= maxImages ? "opacity-50" : ""}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}
          <div className="text-sm text-muted-foreground">
            {isDragActive
              ? t("dropToUpload")
              : images.length >= maxImages
              ? t("maxImagesReached", { count: maxImages })
              : t("dragAndDrop")}
          </div>
          {!isDragActive && images.length < maxImages && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-2"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              {t("selectFiles")}
            </Button>
          )}
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {images
            .sort((a, b) => {
              // Main image comes first
              if (a === mainImage) return -1;
              if (b === mainImage) return 1;
              return 0;
            })
            .map((image, index) => (
              <div
                key={image}
                className={`relative aspect-square rounded-lg overflow-hidden group
                  ${
                    mainImage === image
                      ? "border-2 border-primary ring-2 ring-primary/50"
                      : "border border-border"
                  }`}
              >
                {isLoadingUrls ? (
                  <div className="flex items-center justify-center w-full h-full bg-muted">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <Image
                      src={signedUrls[image]}
                      alt={t(mainImage === image ? "mainImage" : "itemImage", {
                        number: index + 1,
                      })}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeImage(image)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant={mainImage === image ? "default" : "secondary"}
                        size="icon"
                        onClick={() => setAsMainImage(image)}
                        title={t(
                          mainImage === image
                            ? "currentMainImage"
                            : "setAsMainImage"
                        )}
                      >
                        {mainImage === image ? (
                          <Star className="h-4 w-4 fill-current" />
                        ) : (
                          <StarOff className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
