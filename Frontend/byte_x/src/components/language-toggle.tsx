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
        className={current === "en" 
          ? "rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300" 
          : "rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-300"}
      >
        EN
      </Button>
      <Button
        variant={current === "hi" ? "default" : "outline"}
        size="sm"
        onClick={() => switchTo("hi")}
        className={current === "hi" 
          ? "rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300" 
          : "rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-300"}
      >
        हिन्दी
      </Button>
    </div>
  )
}

export default LanguageToggle
