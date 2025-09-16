"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

export function LanguageToggle() {
  const pathname = usePathname()
  const [current, setCurrent] = useState<"en" | "hi">("en")

  useEffect(() => {
    const stored = localStorage.getItem("lang") as "en" | "hi" | null
    setCurrent(stored || "en")
  }, [pathname])

  const switchTo = (lang: "en" | "hi") => {
    localStorage.setItem("lang", lang)
    setCurrent(lang)
    window.dispatchEvent(new CustomEvent("lang-changed", { detail: { lang } }))
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={current === "en" ? "default" : "outline"}
        size="sm"
        onClick={() => switchTo("en")}
      >
        EN
      </Button>
      <Button
        variant={current === "hi" ? "default" : "outline"}
        size="sm"
        onClick={() => switchTo("hi")}
      >
        हिन्दी
      </Button>
    </div>
  )
}

export default LanguageToggle
