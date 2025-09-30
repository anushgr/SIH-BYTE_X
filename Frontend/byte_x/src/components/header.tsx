'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './theme-toggle'
import { Button } from './ui/button'
import { Droplets, User, LogOut, Menu, X } from 'lucide-react'
import { LanguageToggle } from './language-toggle'
import { useAuth } from '@/contexts/auth-context'
import { Avatar, AvatarFallback } from './ui/avatar'
import { useState } from 'react'
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-[1000] w-full border-b border-white/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 shadow-lg">
      <div className="container flex h-16 max-w-screen-2xl items-center px-4 sm:px-6 lg:px-8">
        {/* Logo and Brand - Fixed width on left */}
        <div className="flex items-center flex-shrink-0">
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group" onClick={closeMobileMenu}>
            <div className="relative">
              <Droplets className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
              <div className="absolute inset-0 bg-blue-600/20 dark:bg-blue-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="font-bold text-base sm:text-lg bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent" data-translate="Jalsanchay">
              Jalsranchay
            </span>
          </Link>
        </div>

        {/* Desktop Navigation - Centered */}
        <nav className="hidden lg:flex items-center gap-2 text-sm flex-1 justify-center">
          <Link
            href="/"
            className={`relative px-3 py-2 rounded-full transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 ${
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
            className={`relative px-3 py-2 rounded-full transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 ${
              isActive('/info')
                ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/30'
                : 'text-foreground/70 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <span data-translate="Info">Info</span>
            {isActive('/info') && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
            )}
          </Link>
          <Link
            href="/assessment"
            className={`relative px-3 py-2 rounded-full transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 ${
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
          <Link
            href="/government-schemes"
            className={`relative px-3 py-2 rounded-full transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 ${
              isActive('/government-schemes') 
                ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/30' 
                : 'text-foreground/70 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <span className="hidden xl:inline" data-translate="Government Schemes">Government Schemes</span>
            <span className="xl:hidden" data-translate="Schemes">Schemes</span>
            {isActive('/government-schemes') && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
            )}
          </Link>
        </nav>

        {/* Right side items - Fixed width on right */}
        <div className="flex items-center justify-end space-x-2 flex-shrink-0">
          {/* Desktop Auth and Settings */}
          <div className="hidden lg:flex items-center gap-3">
            {!isLoading && (
              <>
                {user ? (
                  /* User is logged in - show user menu */
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 h-auto p-2 sm:p-3 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-300">
                        <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-blue-200 dark:ring-blue-800">
                          <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                            {user.full_name 
                              ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                              : user.username.charAt(0).toUpperCase()
                            }
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden xl:inline font-medium text-sm">
                          {(user.full_name || user.username).length > 15 
                            ? `${(user.full_name || user.username).substring(0, 15)}...`
                            : (user.full_name || user.username)
                          }
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
                      <Button variant="ghost" size="sm" asChild className="hidden sm:flex rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-300">
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
            
            {/* Desktop Theme and Language toggles */}
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
          <div className="container px-4 py-4">
            {/* Mobile Navigation Links */}
            <nav className="flex flex-col space-y-2 mb-4">
              <Link
                href="/"
                onClick={closeMobileMenu}
                className={`px-4 py-3 rounded-lg transition-all duration-300 ${
                  isActive('/') 
                    ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/30' 
                    : 'text-foreground/70 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                }`}
              >
                <span data-translate="Home">Home</span>
              </Link>
              <Link
                href="/info"
                onClick={closeMobileMenu}
                className={`px-4 py-3 rounded-lg transition-all duration-300 ${
                  isActive('/info')
                    ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/30'
                    : 'text-foreground/70 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                }`}
              >
                <span data-translate="Info">Info</span>
              </Link>
              <Link
                href="/assessment"
                onClick={closeMobileMenu}
                className={`px-4 py-3 rounded-lg transition-all duration-300 ${
                  isActive('/assessment') 
                    ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/30' 
                    : 'text-foreground/70 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                }`}
              >
                <span data-translate="Assessment">Assessment</span>
              </Link>
              <Link
                href="/government-schemes"
                onClick={closeMobileMenu}
                className={`px-4 py-3 rounded-lg transition-all duration-300 ${
                  isActive('/government-schemes') 
                    ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/30' 
                    : 'text-foreground/70 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                }`}
              >
                <span data-translate="Government Schemes">Government Schemes</span>
              </Link>
            </nav>

            {/* Mobile Auth Section */}
            {!isLoading && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-blue-200 dark:ring-blue-800">
                        <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                          {user.full_name 
                            ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                            : user.username.charAt(0).toUpperCase()
                          }
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {user.full_name || user.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleLogout()
                        closeMobileMenu()
                      }}
                      className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </Button>
                  </div>
                ) : (
                  pathname !== '/login' && pathname !== '/signup' && (
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" asChild className="w-full justify-center">
                        <Link href="/login" onClick={closeMobileMenu}>
                          <span data-translate="Sign In">Sign In</span>
                        </Link>
                      </Button>
                      <Button asChild className="w-full justify-center bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                        <Link href="/signup" onClick={closeMobileMenu}>
                          <span data-translate="Sign Up">Sign Up</span>
                        </Link>
                      </Button>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Mobile Settings */}
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}