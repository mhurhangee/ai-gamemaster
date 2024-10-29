'use client'

import logger from '@/lib/logger'
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react'
import { GameState } from '@/lib/types'
import { generateWelcomeMessage } from '@/lib/constants'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  id: string
}

interface TerminalContextType {
  messages: Message[]
  input: string
  isLoading: boolean
  error: Error | null
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isSetupPhase: boolean
}

const TerminalContext = createContext<TerminalContextType | undefined>(undefined)

export const TerminalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [gameState, setGameState] = useState<GameState>({
    loreAndWorldbuilding: {},
    rulesAndMechanics: {},
    charactersAndParties: {},
    questsAndObjectives: {},
    inventoryAndResources: {},
    dialogueAndInteraction: {},
    environmentAndExploration: {},
    combatAndEncounters: {},
    progressionAndSkills: {},
    economyAndTrading: {},
    settingsAndOptions: {},
    setupPhase: {
      completed: false,
      currentAspect: null,
      aspectsCompleted: []
    }
  })

  useEffect(() => {
    const welcomeMessage: Message = {
      role: 'assistant',
      content: generateWelcomeMessage(),
      id: 'welcome'
    }
    setMessages([welcomeMessage])
  }, [])

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
      const assistantMessage: Message = { role: 'assistant', content: data.narratorResponse, id: Date.now().toString() }
      
      logger.info('TerminalProvider.tsx - updatedGameState:', data.gameState)
      setGameState(data.gameState)

      setMessages(prev => [...prev, assistantMessage])

      // Check if setup phase is completed
      if (data.gameState.setupPhase.completed && !gameState.setupPhase.completed) {
        const setupCompleteMessage: Message = {
          role: 'system',
          content: 'Setup phase completed. The main game is now starting.',
          id: 'setup-complete'
        }
        setMessages(prev => [...prev, setupCompleteMessage])
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [input, messages, gameState])

  const isSetupPhase = !gameState.setupPhase.completed

  return (
    <TerminalContext.Provider
      value={{
        messages,
        input,
        isLoading,
        error,
        handleInputChange,
        handleSubmit,
        isSetupPhase
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