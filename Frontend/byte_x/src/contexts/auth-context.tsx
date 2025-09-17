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

  // Check for existing token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedTokenType = localStorage.getItem('tokenType')
    
    if (savedToken && savedTokenType) {
      setToken(savedToken)
      fetchUserInfo(savedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUserInfo = async (authToken: string) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('token')
        localStorage.removeItem('tokenType')
        setToken(null)
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error)
      // Clear invalid token
      localStorage.removeItem('token')
      localStorage.removeItem('tokenType')
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (newToken: string, tokenType: string) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('tokenType', tokenType)
    setToken(newToken)
    await fetchUserInfo(newToken)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('tokenType')
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