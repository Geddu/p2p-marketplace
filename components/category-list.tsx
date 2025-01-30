import { Gamepad2, Shirt, Car, Smartphone, Home, Book, Gift, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"

const categories = [
  { icon: Gamepad2, label: "gaming" },
  { icon: Shirt, label: "fashion" },
  { icon: Car, label: "vehicles" },
  { icon: Smartphone, label: "electronics" },
  { icon: Home, label: "homeAndGarden" },
  { icon: Book, label: "books" },
  { icon: Gift, label: "gifts" },
  { icon: MoreHorizontal, label: "more" },
]

export function CategoryList() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {categories.map((category) => (
        <Button key={category.label} variant="outline" className="flex flex-col items-center py-2 h-auto">
          <category.icon className="h-6 w-6 mb-1" />
          <span className="text-xs">{t(category.label)}</span>
        </Button>
      ))}
    </div>
  )
}

