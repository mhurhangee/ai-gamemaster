'use client'

import logger from '@/lib/logger'
import React, { createContext, useState, useContext, useCallback } from 'react'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  id: string
}

interface GameState {
  party: any
  story: any
  inventory: any
}

interface TerminalContextType {
  messages: Message[]
  input: string
  isLoading: boolean
  error: Error | null
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

const TerminalContext = createContext<TerminalContextType | undefined>(undefined)

export const TerminalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [gameState, setGameState] = useState<GameState>({
    party: {},
    story: { isNewGame: true },
    inventory: {}
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim() === '') return

    const userMessage: Message = { role: 'user', content: input, id: Date.now().toString() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/game-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage], gameState }),
      })

      if (!response.ok) throw new Error('Failed to fetch response')

      const data = await response.json()
      const assistantMessage: Message = { role: 'assistant', content: data.content, id: Date.now().toString() }
      
      logger.info('TerminalProvider.tsx - gameState:', data.gameState)
      setGameState(data.gameState)

      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [input, messages, gameState])

  return (
    <TerminalContext.Provider
      value={{
        messages,
        input,
        isLoading,
        error,
        handleInputChange,
        handleSubmit,
      }}
    >
      {children}
    </TerminalContext.Provider>
  )
}

export const useTerminal = () => {
  const context = useContext(TerminalContext)
  if (!context) throw new Error('useTerminal must be used within a TerminalProvider')
  return context
}