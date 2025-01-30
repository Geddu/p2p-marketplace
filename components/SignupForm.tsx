"use client"

import { useState } from "react"
import { useAuth } from "@/lib/AuthContext"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { User, Lock, Mail } from "lucide-react"

export function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isSignupComplete, setIsSignupComplete] = useState(false)
  const { signUp } = useAuth()
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signUp(email, password)
      toast.success(t("signupSuccess"), {
        description: t("checkEmailForConfirmation"),
      })
      setIsSignupComplete(true)
    } catch (error) {
      console.error("Error signing up:", error)
      toast.error(t("signupError"), {
        description: t("tryAgainLater"),
      })
    }
  }

  const openGmail = () => {
    const gmailUrl = "https://mail.google.com"
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      window.location.href = "googlegmail://"
    } else {
      window.open(gmailUrl, "_blank")
    }
  }

  if (isSignupComplete) {
    return (
      <motion.div
        className="space-y-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold">{t("signupComplete")}</h2>
        <p>{t("checkEmailForConfirmation")}</p>
        <Button onClick={openGmail} className="mt-4">
          {t("openGmail")}
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-2">
        <Label htmlFor="name">{t("name")}</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="pl-10"
            placeholder={t("enterName")}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-10"
            placeholder={t("enterEmail")}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t("password")}</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pl-10"
            placeholder={t("enterPassword")}
          />
        </div>
      </div>
      <Button type="submit" className="w-full">
        {t("signup")}
      </Button>
    </motion.form>
  )
}

