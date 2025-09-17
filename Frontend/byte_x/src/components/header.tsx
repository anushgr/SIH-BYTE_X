'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './theme-toggle'
import { Button } from './ui/button'
import { Droplets, User, LogOut } from 'lucide-react'
import { LanguageToggle } from './language-toggle'
import { useAuth } from '@/contexts/auth-context'
import { Avatar, AvatarFallback } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuth()

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Logo and Brand */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Droplets className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="hidden font-bold sm:inline-block" data-translate="RTRWH Platform">
              RTRWH Platform
            </span>
          </Link>
        </div>

        {/* Mobile Logo */}
        <div className="mr-4 flex md:hidden">
          <Link href="/" className="flex items-center space-x-2">
            <Droplets className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="font-bold" data-translate="RTRWH">RTRWH</span>
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
            <span data-translate="Home">Home</span>
          </Link>
          <Link
            href="/assessment"
            className={`transition-colors hover:text-foreground/80 ${
              isActive('/assessment') 
                ? 'text-foreground font-medium' 
                : 'text-foreground/60'
            }`}
          >
            <span data-translate="Assessment">Assessment</span>
          </Link>
        </nav>

        {/* Right side items */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search or other components can go here */}
          </div>
          
          {/* Auth buttons */}
          <nav className="flex items-center gap-2">
            {!isLoading && (
              <>
                {user ? (
                  /* User is logged in - show user menu */
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-sm">
                            {user.full_name 
                              ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                              : user.username.charAt(0).toUpperCase()
                            }
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:inline">
                          {user.full_name || user.username}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.full_name || user.username}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  /* User is not logged in - show login/signup buttons */
                  pathname !== '/login' && pathname !== '/signup' && (
                    <>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/login"><span data-translate="Sign In">Sign In</span></Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link href="/signup"><span data-translate="Sign Up">Sign Up</span></Link>
                      </Button>
                    </>
                  )
                )}
              </>
            )}
            
            {/* Theme toggle */}
            <LanguageToggle />
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}