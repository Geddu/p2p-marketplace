"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, MessageCircle, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Carousel } from "@/components/carousel"
import { ChatDrawer } from "@/components/chat-drawer"

const item = {
  id: 1,
  title: "Vintage Camera",
  price: 150,
  description: "A beautiful vintage camera in excellent condition. Perfect for collectors or photography enthusiasts.",
  category: "Electronics",
  quality: "Excellent",
  location: "New York, NY",
}

export default function ItemPage() {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const openChat = () => {
    setIsChatOpen(true)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Carousel images={[]} />
      <div className="mt-8 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{item.title}</h1>
          <Button variant="ghost" size="icon" onClick={() => setIsFavorite(!isFavorite)}>
            <Heart className={`h-6 w-6 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        </div>
        <p className="text-2xl font-semibold">${item.price}</p>
        <p className="text-muted-foreground">{item.description}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold">Category</p>
            <p>{item.category}</p>
          </div>
          <div>
            <p className="font-semibold">Quality</p>
            <p>{item.quality}</p>
          </div>
          <div>
            <p className="font-semibold">Location</p>
            <p>{item.location}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="accent" className="flex-1" onClick={openChat}>
            <MessageCircle className="mr-2 h-4 w-4" /> Contact Seller
          </Button>
          <Button variant="accent" className="flex-1">
            <DollarSign className="mr-2 h-4 w-4" /> Request to Buy
          </Button>
        </div>
      </div>

      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        itemTitle={item.title}
        otherPartyName="Seller"
      />
    </div>
  )
}

