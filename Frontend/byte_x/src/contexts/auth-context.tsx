'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: number
  email: string
  username: string
  full_name?: string
  phone?: string
  organization?: string
  is_active: boolean
  created_at: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, tokenType: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing token and user data on mount
  useEffect(() => {
    // Ensure we're on the client side
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    const savedToken = localStorage.getItem('token')
    const savedTokenType = localStorage.getItem('tokenType')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedTokenType) {
      setToken(savedToken)
      
      // If we have saved user data, load it immediately to avoid empty state
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          setUser(userData)
          setIsLoading(false)
          
          // Still fetch fresh user info in the background to ensure data is up-to-date
          fetchUserInfo(savedToken, false)
        } catch (error) {
          console.error('Failed to parse saved user data:', error)
          localStorage.removeItem('user')
          fetchUserInfo(savedToken)
        }
      } else {
        fetchUserInfo(savedToken)
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUserInfo = async (authToken: string, setLoadingState: boolean = true) => {
    if (setLoadingState) {
      setIsLoading(true)
    }
    
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        // Store user data in localStorage for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(userData))
        }
      } else {
        // Token is invalid, clear it
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('tokenType')
          localStorage.removeItem('user')
        }
        setToken(null)
        setUser(null)
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error)
      // Only clear token on network errors if we don't have cached user data
      if (setLoadingState && typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('tokenType')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
      }
    } finally {
      if (setLoadingState) {
        setIsLoading(false)
      }
    }
  }

  const login = async (newToken: string, tokenType: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', newToken)
      localStorage.setItem('tokenType', tokenType)
    }
    setToken(newToken)
    await fetchUserInfo(newToken)
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('tokenType')
      localStorage.removeItem('user')
    }
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}