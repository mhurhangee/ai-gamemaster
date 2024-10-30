// types.ts

import { CoreAspect, GameAspect } from './constants'

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

export interface CoreAspects {
  genre: string
  styleAndTone: string
  theme: string
  moodAndMotifs: string
  moralsAndMainObjective: string
}

export interface GameAspects {
  playerCharacterAndAttributes: Record<string, any>
  partyAndRelationships: Record<string, any>
  questsAndObjectives: Record<string, any>
  inventoryAndEquipment: Record<string, any>
  abilitiesAndMechanics: Record<string, any>
  factionsAndReputation: Record<string, any>
}

export interface GameState {
  coreAspects: CoreAspects
  gameAspects: GameAspects
  setupPhase: {
    completed: boolean
    currentAspect: CoreAspect | GameAspect | null
    aspectsCompleted: (CoreAspect | GameAspect)[]
  }
}

export interface NarratorResponse {
  gameState: GameState
  narratorResponse: string
}