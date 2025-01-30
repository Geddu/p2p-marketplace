"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { useTranslation } from "react-i18next"

interface ChatItem {
  id: number
  itemTitle: string
  otherPartyName: string
  lastMessage: string
  image: string
  totalMessages: number
  unreadMessages: number
}

const buyingChats: ChatItem[] = [
  {
    id: 1,
    itemTitle: "Vintage Camera",
    otherPartyName: "John Doe",
    lastMessage: "Is this still available?",
    image: "/placeholder.svg",
    totalMessages: 5,
    unreadMessages: 2,
  },
  {
    id: 2,
    itemTitle: "Leather Jacket",
    otherPartyName: "Jane Smith",
    lastMessage: "Can you do $180?",
    image: "/placeholder.svg",
    totalMessages: 10,
    unreadMessages: 0,
  },
]

const sellingChats: ChatItem[] = [
  {
    id: 3,
    itemTitle: "Mountain Bike",
    otherPartyName: "Mike Johnson",
    lastMessage: "When can I pick it up?",
    image: "/placeholder.svg",
    totalMessages: 8,
    unreadMessages: 1,
  },
  {
    id: 4,
    itemTitle: "Antique Clock",
    otherPartyName: "Sarah Williams",
    lastMessage: "Is the price negotiable?",
    image: "/placeholder.svg",
    totalMessages: 3,
    unreadMessages: 0,
  },
]

export default function ChatsPage() {
  const [activeChat, setActiveChat] = useState<ChatItem | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { t } = useTranslation()

  const openChat = (chat: ChatItem) => {
    setActiveChat(chat)
    setIsDrawerOpen(true)
  }

  const renderChatList = (chats: ChatItem[]) => (
    <ScrollArea className="h-[calc(100vh-200px)]">
      {chats.map((chat) => (
        <Card
          key={chat.id}
          className={`mb-4 cursor-pointer ${activeChat?.id === chat.id ? "border-primary" : ""}`}
          onClick={() => openChat(chat)}
        >
          <CardHeader className="flex flex-row items-center gap-4 p-4">
            <Avatar>
              <AvatarImage src={chat.image} alt={chat.itemTitle} />
              <AvatarFallback>{chat.otherPartyName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <CardTitle className="text-base">{chat.itemTitle}</CardTitle>
              <CardDescription className="text-sm">{chat.otherPartyName}</CardDescription>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground">
                {chat.totalMessages} {t("messages")}
              </span>
              {chat.unreadMessages > 0 && (
                <Badge variant="destructive" className="mt-1">
                  {chat.unreadMessages} {t("new")}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
          </CardContent>
        </Card>
      ))}
    </ScrollArea>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t("chats")}</h1>
      <Tabs defaultValue="buying" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="buying">{t("buying")}</TabsTrigger>
          <TabsTrigger value="selling">{t("selling")}</TabsTrigger>
        </TabsList>
        <TabsContent value="buying">{renderChatList(buyingChats)}</TabsContent>
        <TabsContent value="selling">{renderChatList(sellingChats)}</TabsContent>
      </Tabs>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{activeChat?.itemTitle}</DrawerTitle>
            <DrawerDescription>{t("chatWith", { name: activeChat?.otherPartyName })}</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 h-[50vh] overflow-y-auto">
            {/* Chat messages would go here */}
            <p className="text-center text-muted-foreground">{t("chatMessagesAppear")}</p>
          </div>
          <DrawerFooter className="flex flex-row items-center gap-2">
            <Input placeholder={t("typeYourMessage")} className="flex-grow" />
            <Button>
              <MessageCircle className="mr-2 h-4 w-4" />
              {t("send")}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">{t("close")}</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

