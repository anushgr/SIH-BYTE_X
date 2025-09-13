'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './theme-toggle'
import { Button } from './ui/button'
import { Droplets } from 'lucide-react'

export function Header() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Logo and Brand */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Droplets className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="hidden font-bold sm:inline-block">
              RTRWH Platform
            </span>
          </Link>
        </div>

        {/* Mobile Logo */}
        <div className="mr-4 flex md:hidden">
          <Link href="/" className="flex items-center space-x-2">
            <Droplets className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="font-bold">RTRWH</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-4 text-sm lg:gap-6">
          <Link
            href="/"
            className={`transition-colors hover:text-foreground/80 ${
              isActive('/') 
                ? 'text-foreground font-medium' 
                : 'text-foreground/60'
            }`}
          >
            Home
          </Link>
          <Link
            href="/assessment"
            className={`transition-colors hover:text-foreground/80 ${
              isActive('/assessment') 
                ? 'text-foreground font-medium' 
                : 'text-foreground/60'
            }`}
          >
            Assessment
          </Link>
        </nav>

        {/* Right side items */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search or other components can go here */}
          </div>
          
          {/* Auth buttons */}
          <nav className="flex items-center gap-2">
            {pathname !== '/login' && pathname !== '/signup' && (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
            
            {/* Theme toggle */}
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}