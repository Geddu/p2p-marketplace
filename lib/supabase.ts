import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type for the user's profile
export type Profile = {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  invites_left: number;
  reputation_score: number;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

// Type for invites
export type Invite = {
  id: string;
  code: string;
  email: string | null;
  inviter_id: string;
  status: "pending" | "accepted" | "expired";
  created_at: string;
  accepted_at: string | null;
  expires_at: string;
  accepted_profile: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export const getAuthenticatedImageUrl = async (fileName: string) => {
  if (!fileName) return null;

  // Check if the fileName is already a full URL
  if (fileName.startsWith("http://") || fileName.startsWith("https://")) {
    return fileName;
  }

  const bucketName = "item-images";

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 3600);

    if (error) {
      console.error("Error creating signed URL:", error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Error in getAuthenticatedImageUrl:", error);
    return null;
  }
};
