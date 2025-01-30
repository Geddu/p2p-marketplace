import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useTranslation } from "react-i18next"

export function SearchBar() {
  const { t } = useTranslation()

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
      <Input type="search" placeholder={t("search")} className="pl-10 w-full" />
    </div>
  )
}

