"use client"

import { useState, useEffect } from "react"
import { UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import { supabase, getAuthenticatedImageUrl } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

interface ImageUploadProps {
  onChange: (urls: string[]) => void
  value: string[]
  maxImages: number
}

export function ImageUpload({ onChange, value, maxImages }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const { t } = useTranslation()

  useEffect(() => {
    async function loadImageUrls() {
      const urls = await Promise.all(value.map((path) => getAuthenticatedImageUrl(path)))
      setImageUrls(urls.filter((url): url is string => url !== null))
    }
    loadImageUrls()
  }, [value])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)

    const newPaths: string[] = []

    for (let i = 0; i < files.length && value.length + newPaths.length < maxImages; i++) {
      const file = files[i]
      const fileExt = file.name.split(".").pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage.from("items").upload(filePath, file)

      if (uploadError) {
        console.error("Error uploading file:", uploadError)
      } else {
        newPaths.push(filePath)
      }
    }

    onChange([...value, ...newPaths])
    setUploading(false)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4">
        {imageUrls.map((url, index) => (
          <div key={index} className="w-24 h-24 relative">
            <img
              src={url || "/placeholder.svg"}
              alt={`${t("uploadedImage")} ${index + 1}`}
              className="w-full h-full object-cover rounded"
            />
          </div>
        ))}
      </div>
      {value.length < maxImages && (
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById("file-upload")?.click()}
          disabled={uploading}
        >
          <UploadCloud className="mr-2 h-4 w-4" />
          {uploading ? t("uploading") : t("uploadImage")}
        </Button>
      )}
      <input id="file-upload" type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
    </div>
  )
}

