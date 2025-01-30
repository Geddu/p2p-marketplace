"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/image-upload"
import { useTranslation } from "react-i18next"
import { supabase } from "@/lib/supabase"

const formSchema = z.object({
  title: z.string().min(2).max(50),
  description: z.string().min(10).max(500),
  category: z.string(),
  price: z.string(),
  quality: z.string(),
  location: z.string(),
  images: z.array(z.string()).min(1).max(3),
})

export default function EditItemPage() {
  const { id } = useParams()
  const [images, setImages] = useState<string[]>([])
  const { t } = useTranslation()
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      price: "",
      quality: "",
      location: "",
      images: [],
    },
  })

  useEffect(() => {
    async function fetchItemData() {
      if (id) {
        const { data, error } = await supabase.from("items").select("*").eq("id", id).single()

        if (error) {
          console.error("Error fetching item:", error)
        } else if (data) {
          form.reset(data)
          setImages(data.images)
        }
      }
    }
    fetchItemData()
  }, [id, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (id) {
      const { data, error } = await supabase.from("items").update(values).eq("id", id)

      if (error) {
        console.error("Error updating item:", error)
      } else {
        router.push("/my-items")
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t("editItem")}</h1>
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
                    onChange={(urls) => {
                      setImages(urls)
                      field.onChange(urls)
                    }}
                    value={images}
                    maxImages={3}
                  />
                </FormControl>
                <FormDescription>{t("uploadImagesDescription")}</FormDescription>
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
                  <Textarea placeholder={t("describeYourItem")} className="resize-none" {...field} />
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectCategory")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="electronics">{t("electronics")}</SelectItem>
                    <SelectItem value="fashion">{t("fashion")}</SelectItem>
                    <SelectItem value="home">{t("homeAndGarden")}</SelectItem>
                    <SelectItem value="sports">{t("sportsAndOutdoors")}</SelectItem>
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
                  <Input type="number" placeholder={t("enterPrice")} {...field} />
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          <Button type="submit">{t("save")}</Button>
        </form>
      </Form>
    </div>
  )
}

