"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { Message } from 'ai'
import { GameState } from '@/types/game-state'
import { processGameAction } from '@/lib/game-engine'
import { saveGame, loadGame } from '@/lib/save-load-manager'
import { initializeGameLore } from '@/lib/game-lore-keeper'

interface TerminalContextType {
  messages: Message[]
  input: string
  gameState: GameState
  isLoading: boolean
  error: Error | null
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  updateGameState: (newState: Partial<GameState>) => void
  processAction: (action: string) => Promise<void>
  saveCurrentGame: () => Promise<string>
  loadSavedGame: (saveCode: string) => Promise<void>
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
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [gameState, setGameState] = useState<GameState>({
    party: [],
    world: {
      locations: {},
      time: 'dawn',
      weather: 'clear',
      events: [],
    },
    currentLocation: 'start',
    inventory: [],
    questLog: [],
    gameLore: initializeGameLore(),
  })

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim() !== '') {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...messages, { role: 'user', content: input }],
          }),
        })
        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }
        setMessages(data.messages)
        setGameState(prevState => ({ ...prevState, ...data.gameState }))
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unexpected error occurred'))
      } finally {
        setIsLoading(false)
        setInput('')
      }
    }
  }, [input, messages])

  const updateGameState = useCallback((newState: Partial<GameState>) => {
    setGameState((prevState) => ({ ...prevState, ...newState }))
  }, [])

  const processAction = useCallback(async (action: string) => {
    if (action.trim() !== '') {
      const updatedState = await processGameAction(gameState, action, '')
      setGameState(updatedState)
    }
  }, [gameState])

  const saveCurrentGame = useCallback(async () => {
    const saveCode = await saveGame(gameState)
    return saveCode
  }, [gameState])

  const loadSavedGame = useCallback(async (saveCode: string) => {
    const loadedState = await loadGame(saveCode)
    if (loadedState) {
      setGameState(loadedState)
      setMessages([{ role: 'system', content: 'Game loaded successfully.', id: 'load' }])
      processAction('/load ' + saveCode)
    } else {
      setMessages([{ role: 'system', content: 'Failed to load game.', id: 'load-error' }])
    }
  }, [processAction])

  return (
    <TerminalContext.Provider
      value={{
        messages,
        input,
        gameState,
        isLoading,
        error,
        handleInputChange,
        handleSubmit,
        updateGameState,
        processAction,
        saveCurrentGame,
        loadSavedGame,
      }}
    >
      {children}
    </TerminalContext.Provider>
  )
}