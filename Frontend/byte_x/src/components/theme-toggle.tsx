"use client"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { Moon, Sun, Monitor } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    const effective = mounted ? theme : 'system'
    switch (effective) {
      case 'light':
        return <Sun className="h-4 w-4" />
      case 'dark':
        return <Moon className="h-4 w-4" />
      case 'system':
        return <Monitor className="h-4 w-4" />
      default:
        return <Sun className="h-4 w-4" />
    }
  }

  const getLabel = () => {
    const effective = mounted ? theme : 'system'
    switch (effective) {
      case 'light':
        return 'Light mode'
      case 'dark':
        return 'Dark mode'
      case 'system':
        return 'System theme'
      default:
        return 'Light mode'
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={cycleTheme}
      className="relative transition-all duration-200 hover:scale-105"
      title={getLabel()}
    >
      <div className="relative flex items-center justify-center">
        {getIcon()}
      </div>
      <span className="sr-only">{getLabel()}</span>
    </Button>
  )
}

// Alternative dropdown version for more detailed control
export function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600 dark:text-gray-400">Theme:</span>
      <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Button
          variant={theme === 'light' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTheme('light')}
          className="rounded-none border-0"
        >
          <Sun className="h-4 w-4" />
        </Button>
        <Button
          variant={theme === 'dark' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTheme('dark')}
          className="rounded-none border-0"
        >
          <Moon className="h-4 w-4" />
        </Button>
        <Button
          variant={theme === 'system' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTheme('system')}
          className="rounded-none border-0"
        >
          <Monitor className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}