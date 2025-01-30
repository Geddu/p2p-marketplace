"use client"

import { useState, useEffect } from "react"
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
import { useAuth } from "@/lib/AuthContext"
import { supabase } from "@/lib/supabase"

interface ChatDrawerProps {
  isOpen: boolean
  onClose: () => void
  itemTitle: string
  otherPartyName: string
  chatId: string
}

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
}

export function ChatDrawer({ isOpen, onClose, itemTitle, otherPartyName, chatId }: ChatDrawerProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    if (!chatId) return

    // Fetch initial messages
    fetchMessages()

    // Set up realtime subscription
    const subscription = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          setMessages((prevMessages) => [...prevMessages, payload.new as Message])
        },
      )
      .subscribe()

    // Cleanup subscription on component unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [chatId])

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching messages:", error)
    } else {
      setMessages(data)
    }
  }

  const sendMessage = async () => {
    if (!user || !newMessage.trim()) return

    const { error } = await supabase.from("messages").insert({
      chat_id: chatId,
      sender_id: user.id,
      content: newMessage.trim(),
    })

    if (error) {
      console.error("Error sending message:", error)
    } else {
      setNewMessage("")
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{itemTitle}</DrawerTitle>
          <DrawerDescription>{t("chatWith", { name: otherPartyName })}</DrawerDescription>
        </DrawerHeader>
        <div className="p-4 h-[50vh] overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className={`mb-2 ${message.sender_id === user?.id ? "text-right" : "text-left"}`}>
              <div
                className={`inline-block p-2 rounded-lg ${message.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
        <DrawerFooter className="flex flex-row items-center gap-2">
          <Input
            placeholder={t("typeYourMessage")}
            className="flex-grow"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button onClick={sendMessage}>
            <MessageCircle className="mr-2 h-4 w-4" />
            {t("send")}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

