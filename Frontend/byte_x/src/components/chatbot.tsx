"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, X, Send } from "lucide-react"

interface Message {
  id: number
  text: string
  isUser: boolean
  timestamp: Date
}

interface ChatResponse {
  success: boolean
  message: string
  response: string
  query: string
}

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! Welcome to Jalsanchay - Rainwater Harvesting Platform. I'm here to help you with any questions about rainwater harvesting, groundwater management, and water conservation based on official Indian government resources.",
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '' || isLoading) return

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    }

    // Add user message immediately
    setMessages(prev => [...prev, userMessage])
    const currentQuery = inputMessage
    setInputMessage('')
    setIsLoading(true)

    // Add typing indicator
    const typingMessage: Message = {
      id: messages.length + 2,
      text: "finding result...",
      isUser: false,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, typingMessage])

    try {
      // Call backend API
      const response = await fetch('http://localhost:8000/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentQuery,
          session_id: null // You can implement session management later
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ChatResponse = await response.json()
      
      const botResponse: Message = {
        id: messages.length + 3,
        text: data.success ? data.response : data.message || 'Sorry, I encountered an error while processing your question.',
        isUser: false,
        timestamp: new Date()
      }

      // Replace typing indicator with actual response
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.text !== "finding result...")
        return [...withoutTyping, botResponse]
      })

    } catch (error) {
      console.error('Error calling chatbot API:', error)
      
      const errorResponse: Message = {
        id: messages.length + 3,
        text: 'Sorry, I\'m having trouble connecting to the server right now. Please try again later.',
        isUser: false,
        timestamp: new Date()
      }

      // Replace typing indicator with error response
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.text !== "finding result...")
        return [...withoutTyping, errorResponse]
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Chat Icon - Fixed position at bottom right */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg transition-all duration-300 hover:scale-110"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] shadow-2xl chatbot-enter">
          <Card className="h-full flex flex-col border-0 shadow-2xl">
            {/* Header */}
            <CardHeader className="bg-blue-600 text-white rounded-t-lg p-4 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-semibold">Chat Support</CardTitle>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-blue-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            {/* Messages Container */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      message.isUser
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {message.text === "finding result..." ? (
                      <div className="flex items-center space-x-1">
                        <span>Finding result</span>
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.text}</div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isLoading ? "Processing..." : "Type your message..."}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  disabled={isLoading || inputMessage.trim() === ''}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}