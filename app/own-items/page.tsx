"use client"

import { useState } from "react"
import { Edit, Trash2, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const ownItems = [
  {
    id: 1,
    title: "Vintage Camera",
    price: 150,
    image: "/placeholder.svg",
    clicks: 23,
    messages: 5,
    favorites: 7,
  },
  {
    id: 2,
    title: "Leather Jacket",
    price: 200,
    image: "/placeholder.svg",
    clicks: 45,
    messages: 12,
    favorites: 18,
  },
  // Add more items as needed
]

export default function OwnItemsPage() {
  const [items, setItems] = useState(ownItems)

  const deleteItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Items</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>${item.price}</CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{item.clicks} clicks</span>
                <span>{item.messages} messages</span>
                <span>{item.favorites} favorites</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <BarChart2 className="mr-2 h-4 w-4" />
                    Stats
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Item Statistics</DialogTitle>
                    <DialogDescription>Detailed stats for {item.title}</DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p>Clicks: {item.clicks}</p>
                    <p>Messages: {item.messages}</p>
                    <p>Favorites: {item.favorites}</p>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="destructive" size="sm" onClick={() => deleteItem(item.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

