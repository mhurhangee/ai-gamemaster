// types.ts

import { GameAspect } from './constants'

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  id: string
}

export interface TerminalContextType {
  messages: Message[]
  input: string
  isLoading: boolean
  error: Error | null
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isSetupPhase: boolean
}

export interface GameState {
  worldAndLore: Record<string, any>
  charactersAndMechanics: Record<string, any>
  questsAndProgression: Record<string, any>
  setupPhase: {
    completed: boolean
    currentAspect: GameAspect | null
    aspectsCompleted: GameAspect[]
  }
}

export interface NarratorResponse {
  gameState: GameState
  narratorResponse: string
}