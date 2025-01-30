"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { UserItemList } from "@/components/user-item-list"

export default function MyItemsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Items</h1>
      <Link href="/new-item">
        <Button className="w-full mb-8">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Item
        </Button>
      </Link>
      <UserItemList />
    </div>
  )
}

