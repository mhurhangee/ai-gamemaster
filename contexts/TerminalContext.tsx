'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react'
import { useChat, Message } from 'ai/react'
import { useRouter } from 'next/navigation'
import { handleCommand, WELCOME_MESSAGE } from '@/components/terminal/TerminalCommands'

interface TerminalContextType {
  messages: Message[]
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  error: Error | null
  isLoading: boolean
  stop: () => void
  isFullscreen: boolean
  toggleFullscreen: () => void
  inputRef: React.RefObject<HTMLInputElement>
}

const TerminalContext = createContext<TerminalContextType | undefined>(undefined)

export const useTerminal = () => {
  const context = useContext(TerminalContext)
  if (context === undefined) {
    throw new Error('useTerminal must be used within a TerminalProvider')
  }
  return context
}

export const TerminalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    error,
    reload,
    setMessages,
    setInput,
    isLoading,
    stop,
  } = useChat({
    initialMessages: [
      { role: "system", content: WELCOME_MESSAGE, id: "welcome" },
    ],
    keepLastMessageOnError: true,
    onError: (error) => {
      console.error("Chat error:", error)
    },
  })

  useEffect(() => {
    inputRef.current?.focus()
  }, [messages])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      const trimmedInput = input.trim()

      if (trimmedInput.startsWith("/")) {
        handleCommand(trimmedInput.slice(1), {
          setMessages,
          reload,
          toggleFullscreen: () => setIsFullscreen(!isFullscreen),
          navigateBack: () => router.back(),
          navigateHome: () => router.push('/'),
        })
        setInput("")
      } else {
        handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
      }
    }
  }

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen)

  const value: TerminalContextType = {
    messages,
    input,
    handleInputChange,
    handleKeyDown,
    error: error || null,
    isLoading,
    stop,
    isFullscreen,
    toggleFullscreen,
    inputRef,
  }

  return <TerminalContext.Provider value={value}>{children}</TerminalContext.Provider>
}