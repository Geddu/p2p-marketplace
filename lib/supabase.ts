import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const getAuthenticatedImageUrl = async (fileName: string) => {
  if (!fileName) return null

  // Check if the fileName is already a full URL
  if (fileName.startsWith("http://") || fileName.startsWith("https://")) {
    return fileName
  }

  const bucketName = "item-images"

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      console.error("No active session")
      return null
    }

    const { data, error } = await supabase.storage.from(bucketName).createSignedUrl(fileName, 3600, {
      token: session.access_token,
    })

    if (error) {
      console.error("Error creating signed URL:", error)
      return null
    }

    return data.signedUrl
  } catch (error) {
    console.error("Error in getAuthenticatedImageUrl:", error)
    return null
  }
}

