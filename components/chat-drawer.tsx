"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer"
import { MessageCircle } from "lucide-react"
import { useTranslation } from "react-i18next"

interface ChatDrawerProps {
  isOpen: boolean
  onClose: () => void
  itemTitle: string
  otherPartyName: string
}

export function ChatDrawer({ isOpen, onClose, itemTitle, otherPartyName }: ChatDrawerProps) {
  const { t } = useTranslation()

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{itemTitle}</DrawerTitle>
          <DrawerDescription>{t("chatWith", { name: otherPartyName })}</DrawerDescription>
        </DrawerHeader>
        <div className="p-4 h-[50vh] overflow-y-auto">
          <p className="text-center text-muted-foreground">{t("chatMessagesAppear")}</p>
        </div>
        <DrawerFooter className="flex flex-row items-center gap-2">
          <Input placeholder={t("typeYourMessage")} className="flex-grow" />
          <Button>
            <MessageCircle className="mr-2 h-4 w-4" />
            {t("send")}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

