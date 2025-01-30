"use client"

import { useState, Suspense } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import dynamic from "next/dynamic"
import { ThemeToggle } from "@/components/theme-toggle"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/AuthContext"

const DynamicPieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), { ssr: false })
const DynamicPie = dynamic(() => import("recharts").then((mod) => mod.Pie), { ssr: false })
const DynamicCell = dynamic(() => import("recharts").then((mod) => mod.Cell), { ssr: false })
const DynamicResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), {
  ssr: false,
})

export function ProfileContent() {
  const [activeTab, setActiveTab] = useState("info")
  const { t, i18n } = useTranslation()
  const { user, signOut } = useAuth()

  const reputationData = [
    { name: "Positive", value: 85, color: "#4ade80" },
    { name: "Neutral", value: 10, color: "#facc15" },
    { name: "Negative", value: 5, color: "#f87171" },
  ]

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  if (!user) {
    return <div>{t("loading")}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="w-24 h-24">
          <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} alt={user.email || ""} />
          <AvatarFallback>{user.email ? user.email[0].toUpperCase() : "U"}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{user.user_metadata?.full_name || user.email}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t("reputation")}</CardTitle>
          <CardDescription>{t("reputationDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Suspense fallback={<div>Loading chart...</div>}>
            <div className="w-32 h-32">
              <DynamicResponsiveContainer width="100%" height="100%">
                <DynamicPieChart>
                  <DynamicPie
                    data={reputationData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                  >
                    {reputationData.map((entry, index) => (
                      <DynamicCell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </DynamicPie>
                </DynamicPieChart>
              </DynamicResponsiveContainer>
            </div>
          </Suspense>
          <div>
            <p>
              {t("positive")}: {reputationData[0].value}%
            </p>
            <p>
              {t("neutral")}: {reputationData[1].value}%
            </p>
            <p>
              {t("negative")}: {reputationData[2].value}%
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="info">{t("personalInfo")}</TabsTrigger>
          <TabsTrigger value="reviews">{t("reviews")}</TabsTrigger>
          <TabsTrigger value="favorites">{t("favorites")}</TabsTrigger>
        </TabsList>
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>{t("personalInformation")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p>
                    <strong>{t("name")}:</strong> {user.user_metadata?.full_name || t("notProvided")}
                  </p>
                  <p>
                    <strong>{t("email")}:</strong> {user.email}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>{t("darkMode")}</span>
                    <ThemeToggle />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t("language")}</span>
                    <Select onValueChange={changeLanguage} defaultValue={i18n.language}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fi">Suomi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="mt-4">{t("editProfile")}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>{t("reviews")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{t("noReviewsYet")}</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="favorites">
          <Card>
            <CardHeader>
              <CardTitle>{t("favoriteItems")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{t("favoriteItemsAppear")}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button variant="outline" className="mt-8" onClick={signOut}>
        {t("signOut")}
      </Button>
    </div>
  )
}

