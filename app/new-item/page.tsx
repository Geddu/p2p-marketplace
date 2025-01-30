"use client"

import { useState } from "react"
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
import { useRouter } from "next/navigation"

const formSchema = z.object({
  title: z.string().min(2).max(50),
  description: z.string().min(10).max(500),
  category: z.string(),
  price: z.string(),
  quality: z.string(),
  location: z.string(),
  images: z.array(z.string()).min(1).max(3),
})

export default function AddItemPage() {
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { data: user } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase.from("items").insert({
        ...values,
        user_id: user.id,
        views: 0,
        favorites: 0,
        conversations: 0,
      })

      if (error) {
        console.error("Error adding item:", error)
      } else {
        router.push("/my-items")
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t("addNewItem")}</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Form fields remain the same */}
          <Button type="submit">{t("addItem")}</Button>
        </form>
      </Form>
    </div>
  )
}

