"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SearchBar } from "@/components/search-bar";
import { CategoryList } from "@/components/category-list";
import { ItemGrid } from "@/components/item-grid";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function Home() {
  const { t } = useTranslation();

  useEffect(() => {
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log(
      "Supabase Anon Key:",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set"
    );
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-4xl font-bold text-center mb-8">{t("appName")}</h1>
      <SearchBar />
      <CategoryList />
      <h2 className="text-2xl font-semibold mb-4">{t("recommendedForYou")}</h2>
      <ItemGrid />
    </div>
  );
}
