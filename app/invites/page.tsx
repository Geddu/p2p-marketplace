"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTranslation } from "react-i18next"

const invitedUsers = [
  { id: 1, name: "Alice Johnson", reputation: 4.5, avatar: "/placeholder.svg" },
  { id: 2, name: "Bob Smith", reputation: 3.8, avatar: "/placeholder.svg" },
  { id: 3, name: "Charlie Brown", reputation: 4.2, avatar: "/placeholder.svg" },
]

export default function InvitesPage() {
  const [invitesLeft, setInvitesLeft] = useState(3)
  const [inviteEmail, setInviteEmail] = useState("")
  const { t } = useTranslation()

  const calculateDiscount = () => {
    const positiveReputations = invitedUsers.filter((user) => user.reputation > 3).length
    return positiveReputations * 2
  }

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (invitesLeft > 0) {
      // Here you would typically send the invite email
      console.log(`Invited ${inviteEmail}`)
      setInvitesLeft(invitesLeft - 1)
      setInviteEmail("")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t("invites")}</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t("inviteFriends")}</CardTitle>
          <CardDescription>{t("invitesLeft", { count: invitesLeft })}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("friendsEmail")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("enterEmailAddress")}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="accent" disabled={invitesLeft === 0}>
              {t("sendInvite")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t("yourDiscount")}</CardTitle>
          <CardDescription>{t("discountDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {calculateDiscount()}% {t("off")}
          </p>
          <p className="text-sm text-muted-foreground">{t("discountExplanation")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("invitedUsers")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invitedUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("reputation")}: {user.reputation.toFixed(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

