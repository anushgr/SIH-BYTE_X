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
    <header className="sticky top-0 z-[1000] w-full border-b border-white/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 shadow-lg">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        {/* Logo and Brand */}
        <div className="mr-6 hidden md:flex">
          <Link href="/" className="mr-8 flex items-center space-x-3 group">
            <div className="relative">
              <Droplets className="h-8 w-8 text-blue-600 dark:text-blue-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
              <div className="absolute inset-0 bg-blue-600/20 dark:bg-blue-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="hidden font-bold text-lg bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent sm:inline-block" data-translate="RTRWH Platform">
              RTRWH Platform
            </span>
          </Link>
        </div>

        {/* Mobile Logo */}
        <div className="mr-6 flex md:hidden">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Droplets className="h-8 w-8 text-blue-600 dark:text-blue-400 transition-all duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-blue-600/20 dark:bg-blue-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent" data-translate="RTRWH">RTRWH</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-2 text-sm lg:gap-4">
          <Link
            href="/"
            className={`relative px-4 py-2 rounded-full transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 ${
              isActive('/') 
                ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/30' 
                : 'text-foreground/70 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <span data-translate="Home">Home</span>
            {isActive('/') && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
            )}
          </Link>
          <Link
            href="/info"
            className={`transition-colors hover:text-foreground/80 ${
              isActive('/info') 
                ? 'text-foreground font-medium' 
                : 'text-foreground/60'
            }`}
          >
            <span data-translate="Info">Info</span>
          </Link>
          <Link
            href="/assessment"
            className={`relative px-4 py-2 rounded-full transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 ${
              isActive('/assessment') 
                ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/30' 
                : 'text-foreground/70 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <span data-translate="Assessment">Assessment</span>
            {isActive('/assessment') && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
            )}
          </Link>
        </nav>

        {/* Right side items */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search or other components can go here */}
          </div>
          
          {/* Auth buttons */}
          <nav className="flex items-center gap-3">
            {!isLoading && (
              <>
                {user ? (
                  /* User is logged in - show user menu */
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-3 h-auto p-3 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-300">
                        <Avatar className="h-9 w-9 ring-2 ring-blue-200 dark:ring-blue-800">
                          <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                            {user.full_name 
                              ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                              : user.username.charAt(0).toUpperCase()
                            }
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:inline font-medium">
                          {user.full_name || user.username}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/30">
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
                      <DropdownMenuItem onClick={handleLogout} className="hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  /* User is not logged in - show login/signup buttons */
                  pathname !== '/login' && pathname !== '/signup' && (
                    <>
                      <Button variant="ghost" size="sm" asChild className="rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-300">
                        <Link href="/login"><span data-translate="Sign In">Sign In</span></Link>
                      </Button>
                      <Button size="sm" asChild className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                        <Link href="/signup"><span data-translate="Sign Up">Sign Up</span></Link>
                      </Button>
                    </>
                  )
                )}
              </>
            )}
            
            {/* Theme toggle */}
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}