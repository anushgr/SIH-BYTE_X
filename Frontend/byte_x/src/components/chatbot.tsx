"use client"

import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, X, Send, Mic, MicOff, Languages } from "lucide-react"
import { AudioConverter } from "@/utils/audioUtils"

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

interface VoiceResponse {
  success: boolean
  transcribed_text: string
  message: string
}

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! Welcome to Jalsanchay - Rainwater Harvesting Platform. I'm here to help you with any questions about rainwater harvesting, groundwater management, and water conservation based on official Indian government resources. You can type your message or use the voice button to speak in English or Hindi.",
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [isProcessingVoice, setIsProcessingVoice] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

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

  const startRecording = async () => {
    try {
      // Check if audio recording is supported
      if (!AudioConverter.isSupported()) {
        alert('Voice recording is not supported in your browser.')
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      })
      
      streamRef.current = stream
      audioChunksRef.current = []
      
      const recorderOptions = AudioConverter.getRecorderOptions()
      const mediaRecorder = new MediaRecorder(stream, recorderOptions)
      
      mediaRecorderRef.current = mediaRecorder
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Unable to access microphone. Please check your permissions and ensure you\'re using a secure connection (HTTPS).')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      mediaRecorderRef.current.onstop = async () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
        
        if (audioChunksRef.current.length > 0) {
          await processVoiceRecording()
        }
      }
    }
  }

  const processVoiceRecording = async () => {
    setIsProcessingVoice(true)
    
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      
      // Convert to WAV format for better compatibility
      const wavBlob = await convertToWav(audioBlob)
      
      const formData = new FormData()
      formData.append('file', wavBlob, 'recording.wav')
      formData.append('language', selectedLanguage)
      
      const response = await fetch('http://localhost:8000/api/chatbot/voice/transcribe', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: VoiceResponse = await response.json()
      
      if (data.success && data.transcribed_text.trim()) {
        setInputMessage(data.transcribed_text)
        
        // Automatically send the transcribed message
        setTimeout(() => {
          const transcribedText = data.transcribed_text.trim()
          if (transcribedText) {
            // Add user message
            const userMessage: Message = {
              id: messages.length + Date.now(),
              text: transcribedText,
              isUser: true,
              timestamp: new Date()
            }
            
            setMessages(prev => [...prev, userMessage])
            setInputMessage('')
            setIsLoading(true)
            
            // Add typing indicator and get bot response
            handleChatResponse(transcribedText)
          }
        }, 100)
        
      } else {
        alert(data.message || 'No speech detected. Please try again.')
      }
      
    } catch (error) {
      console.error('Error processing voice:', error)
      alert('Failed to process voice recording. Please try again.')
    } finally {
      setIsProcessingVoice(false)
    }
  }

  const convertToWav = async (audioBlob: Blob): Promise<Blob> => {
    try {
      return await AudioConverter.convertWebMToWav(audioBlob)
    } catch (error) {
      console.warn('Audio conversion failed, using original format:', error)
      return audioBlob
    }
  }

  const handleChatResponse = async (message: string) => {
    // Add typing indicator
    const typingMessage: Message = {
      id: messages.length + Date.now() + 1,
      text: "finding result...",
      isUser: false,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, typingMessage])

    try {
      const response = await fetch('http://localhost:8000/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          session_id: null
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ChatResponse = await response.json()
      
      const botResponse: Message = {
        id: messages.length + Date.now() + 2,
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
        id: messages.length + Date.now() + 2,
        text: 'Sorry, I\'m having trouble connecting to the server right now. Please try again later.',
        isUser: false,
        timestamp: new Date()
      }

      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.text !== "finding result...")
        return [...withoutTyping, errorResponse]
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <>
      {/* Chat Icon - Fixed position at bottom right */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 hover:bg-blue-700 shadow-lg transition-all duration-300 hover:scale-110"
          size="icon"
        >
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-16 right-2 sm:bottom-24 sm:right-6 z-50 w-[calc(100vw-1rem)] max-w-sm sm:w-96 h-80 sm:h-[500px] shadow-2xl chatbot-enter">
          <Card className="h-full flex flex-col border-0 shadow-2xl">
            {/* Header */}
            <CardHeader className="bg-blue-600 text-white rounded-t-lg p-3 sm:p-4">
              <div className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base sm:text-lg font-semibold truncate">Chat Support</CardTitle>
                <div className="flex items-center space-x-2">
                  {/* Language Selector */}
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-blue-700 text-white text-xs border-none rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300"
                    disabled={isRecording || isProcessingVoice}
                  >
                    <option value="en">EN</option>
                    <option value="hi">हिं</option>
                  </select>
                  
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8 text-white hover:bg-blue-700 flex-shrink-0"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages Container */}
            <CardContent className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${
                      message.isUser
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none'
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
            <div className="p-3 sm:p-4 border-t dark:border-gray-600">
              {/* Voice Status Indicator */}
              {(isRecording || isProcessingVoice) && (
                <div className="mb-2 text-center">
                  <div className="inline-flex items-center px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-xs">
                    {isRecording ? (
                      <>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                        Recording... (Click mic to stop)
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse mr-2"></div>
                        Processing voice...
                      </>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    isLoading ? "Processing..." : 
                    isRecording ? "Recording..." :
                    isProcessingVoice ? "Processing voice..." :
                    "Type your message or use voice..."
                  }
                  disabled={isLoading || isRecording || isProcessingVoice}
                  className="flex-1 px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                />
                
                {/* Voice Button */}
                <Button
                  onClick={toggleRecording}
                  size="icon"
                  disabled={isLoading || isProcessingVoice}
                  className={`h-8 w-8 sm:h-10 sm:w-10 transition-colors ${
                    isRecording 
                      ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                      : 'bg-green-600 hover:bg-green-700'
                  } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                  title={`Voice input (${selectedLanguage === 'en' ? 'English' : 'Hindi'})`}
                >
                  {isRecording ? (
                    <MicOff className="h-3 w-3 sm:h-4 sm:w-4" />
                  ) : (
                    <Mic className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </Button>
                
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  disabled={isLoading || inputMessage.trim() === '' || isRecording || isProcessingVoice}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed h-8 w-8 sm:h-10 sm:w-10"
                >
                  <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}