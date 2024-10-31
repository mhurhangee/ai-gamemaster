import { NextRequest } from 'next/server'
import { CoreMessage } from 'ai'
import { CORE_ASPECTS, GAME_ASPECTS, CoreAspect, GameAspect, MESSAGE_HISTORY_LENGTH } from '@/lib/constants'
import { GameState } from '@/lib/types'
import { generateAI } from '@/lib/aiWrappers'
//import logger from '@/lib/logger'

export async function POST(req: NextRequest) {
  const { messages, gameState: previousGameState } = await req.json()

  // Initialize game state or use the previous state
  const gameState = initializeGameState(previousGameState)
  
  const recentMessages = messages.slice(-MESSAGE_HISTORY_LENGTH)
  const lastUserMessage = String(messages[messages.length - 1].content)

  let updatedGameState: GameState
  let narratorResponse: string

  // Determine the game phase and handle accordingly
  if (lastUserMessage.startsWith('@')) {
    // Handle gamemaster commands
    ({ gameState: updatedGameState, narratorResponse } = await handleGamemasterCommand(gameState, lastUserMessage.slice(1), recentMessages))
  } else if (!gameState.setupPhase.completed) {
    // Handle setup phase
    ({ gameState: updatedGameState, narratorResponse } = await handleSetupPhase(gameState, recentMessages))
  } else {
    // Handle main game phase
    ({ gameState: updatedGameState, narratorResponse } = await handleMainGame(gameState, recentMessages))
  }

  // Generate ASCII art
  //const asciiArt = await generateASCIIArt(narratorResponse)

  // Combine narrator response with ASCII art
  const combinedResponse = `${narratorResponse}`//\n\n\`\`\`\n${asciiArt}\n\`\`\``

  return Response.json({ narratorResponse: combinedResponse, gameState: updatedGameState })
}

// Helper functions

async function handleGamemasterCommand(gameState: GameState, command: string, recentMessages: CoreMessage[]): Promise<{ gameState: GameState; narratorResponse: string }> {
  // Process gamemaster command and update game state
  const updatedGameState = await generateAI('GAMEMASTER', { gameState, userMessage: command }, recentMessages) as unknown as GameState
  return { gameState: updatedGameState, narratorResponse: "Game state updated as per your request." }
}

async function handleSetupPhase(gameState: GameState, recentMessages: CoreMessage[]): Promise<{ gameState: GameState; narratorResponse: string }> {
  // Initialize current aspect if not set
  if (!gameState.setupPhase.currentAspect) {
    gameState.setupPhase.currentAspect = 'genre'
  }

  // Generate narrator response for current aspect
  const narratorResponse = await generateAI('SETUP_NARRATOR', { 
    gameState, 
    currentAspect: gameState.setupPhase.currentAspect 
  }, recentMessages) as string

  // Update game state based on user input
  const updatedGameState = await updateGameState(gameState, recentMessages, true)
  
  // Check if setup is complete
  const setupComplete = await isSetupComplete(updatedGameState, recentMessages)
  
  if (setupComplete) {
    updatedGameState.setupPhase.completed = true
    const storySeed = await generateAI('STORY_SEED_GENERATOR', { gameState: updatedGameState }, recentMessages) as string
    return { 
      gameState: updatedGameState, 
      narratorResponse: narratorResponse + "\n\nSetup complete! Your adventure begins:\n" + storySeed 
    }
  }
  
  return { gameState: updatedGameState, narratorResponse }
}

async function updateGameState(gameState: GameState, recentMessages: CoreMessage[], isSetupPhase: boolean): Promise<GameState> {
  // Determine which aspect to update
  const aspectToUpdate = await generateAI('DETECTOR', { 
    gameState, 
    isSetupPhase, 
    lastAIResponse: recentMessages[recentMessages.length - 2]?.content, 
    userMessage: recentMessages[recentMessages.length - 1]?.content 
  }, recentMessages) as CoreAspect | GameAspect | 'moveToNext'

  if (aspectToUpdate === 'moveToNext') {
    return moveToNextAspect(gameState, isSetupPhase)
  }

  // Update the appropriate aspect
  if (isSetupPhase && aspectToUpdate in CORE_ASPECTS) {
    gameState.coreAspects[aspectToUpdate as CoreAspect] = await updateAspect('CORE', aspectToUpdate as CoreAspect, gameState.coreAspects[aspectToUpdate as CoreAspect], recentMessages)
  } else if (aspectToUpdate in GAME_ASPECTS) {
    gameState.gameAspects[aspectToUpdate as GameAspect] = await updateAspect('GAME', aspectToUpdate as GameAspect, gameState.gameAspects[aspectToUpdate as GameAspect], recentMessages)
  }

  return gameState
}

async function updateAspect(aspectType: 'CORE' | 'GAME', aspect: CoreAspect | GameAspect, currentState: any, recentMessages: CoreMessage[]): Promise<any> {
  const result = await generateAI('ASPECT_UPDATER', { 
    aspect, 
    aspectState: currentState
  }, recentMessages)
  return aspectType === 'CORE' ? result as string : result as Record<string, any>
}

function moveToNextAspect(gameState: GameState, isSetupPhase: boolean): GameState {
  if (isSetupPhase) {
    const coreAspects = Object.keys(CORE_ASPECTS) as CoreAspect[]
    const gameAspects = Object.keys(GAME_ASPECTS) as GameAspect[]
    const allAspects = [...coreAspects, ...gameAspects]
    const currentIndex = allAspects.indexOf(gameState.setupPhase.currentAspect as CoreAspect | GameAspect)
    gameState.setupPhase.currentAspect = allAspects[(currentIndex + 1) % allAspects.length]
    gameState.setupPhase.aspectsCompleted.push(gameState.setupPhase.currentAspect)
  }
  return gameState
}

async function isSetupComplete(gameState: GameState, recentMessages: CoreMessage[]): Promise<boolean> {
  const completionResponse = await generateAI('SETUP_COMPLETE_CHECKER', { gameState }, recentMessages) as 'true' | 'false'
  return completionResponse === 'true'
}

async function handleMainGame(gameState: GameState, recentMessages: CoreMessage[]): Promise<{ gameState: GameState; narratorResponse: string }> {
  // Update game state (only game aspects can be updated in main game phase)
  gameState = await updateGameState(gameState, recentMessages, false)

  // Generate narrator response for the main game
  const narratorResponse = await generateAI('MAIN_GAME_NARRATOR', { gameState }, recentMessages) as string

  return { gameState, narratorResponse }
}

async function generateASCIIArt(sceneDescription: string): Promise<string> {
  try {
    const asciiArt = await generateAI('ASCII_ART_GENERATOR', { 
      sceneDescription 
    }, []) as string;
    
    return asciiArt.trim();
  } catch (error) {
    console.error('Failed to generate ASCII art:', error);
    return ''; // Return empty string if generation fails
  }
}

function initializeGameState(previousGameState: Partial<GameState>): GameState {
  return {
    coreAspects: previousGameState.coreAspects || {
      genre: '',
      styleAndTone: '',
      theme: '',
      moodAndMotifs: '',
      moralsAndMainObjective: ''
    },
    gameAspects: previousGameState.gameAspects || {
      playerCharacterAndAttributes: {},
      partyAndRelationships: {},
      questsAndObjectives: {},
      inventoryAndEquipment: {},
      abilitiesAndMechanics: {},
      factionsAndReputation: {}
    },
    setupPhase: previousGameState.setupPhase || { completed: false, currentAspect: null, aspectsCompleted: [] }
  } as GameState
}