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

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! Welcome to Jalsanchay - Rainwater Harvesting Platform. I'm here to help you with any questions about rainwater harvesting.",
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    }

    // Add user message immediately
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')

    // Add typing indicator or loading state
    const typingMessage: Message = {
      id: messages.length + 2,
      text: "finding result...",
      isUser: false,
      timestamp: new Date()
    }

    // Show typing indicator
    setMessages(prev => [...prev, typingMessage])

    // Delayed bot response (5 seconds)
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 3,
        text: `Here are the main groundwater recharge structures:

🔸 Percolation tank - Stores runoff to slowly seep into aquifers.
🔸 Check dam / Nala bund - Small barriers across streams to enhance infiltration.
🔸 Contour bund / trench - Slows down slope runoff, promotes percolation.
🔸 Sub-surface dyke - Underground wall to stop groundwater from draining away.
🔸 Recharge well - Directs surface water into deeper aquifers.
🔸 Injection well - Pumps treated water into confined aquifers.
🔸 Recharge shaft - Vertical shaft bypassing impermeable layers for recharge.
🔸 Recharge pit - Small pit with filter media for rooftop rainwater.
🔸 Recharge trench - Shallow linear trench to absorb runoff.
🔸 Soak pit - Small circular pit for household rooftop recharge.
🔸 Gabion structure - Boulder-filled wire mesh slowing channel flow.
🔸 Sand dam - Stores water within accumulated sand for gradual recharge.
🔸 Anicut / weir - Low barrier in rivers to hold and infiltrate water.

These structures help capture and infiltrate rainwater to replenish groundwater aquifers naturally.`,
        isUser: false,
        timestamp: new Date()
      }

      // Replace typing indicator with actual response
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.text !== "finding result...")
        return [...withoutTyping, botResponse]
      })
    }, 5000) // 5-second delay
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
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
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  className="bg-blue-600 hover:bg-blue-700"
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