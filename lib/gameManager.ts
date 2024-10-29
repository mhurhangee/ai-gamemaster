// gameManager.ts

import { CoreMessage } from 'ai'
import { GAME_ASPECTS, GameAspect } from './constants'
import { GameState } from './types'
import { generateAI } from './aiWrappers'
import logger from './logger'

export async function gameManager(messages: CoreMessage[], previousGameState: Partial<GameState>): Promise<{ gameState: GameState; narratorResponse: string }> {
  const gameState: GameState = initializeGameState(previousGameState)
  logger.debug('gameManager: Initial game state', JSON.stringify(gameState, null, 2))
  
  const lastUserMessage = String(messages[messages.length - 1].content)
  const lastAIResponse = messages.length > 1 ? String(messages[messages.length - 2].content) : ''

  if (lastUserMessage.startsWith('@')) {
    return handleGamemasterCommand(gameState, lastUserMessage.slice(1))
  }

  if (!gameState.setupPhase.completed) {
    logger.debug('gameManager: Entering setup phase')
    return handleSetupPhase(gameState, lastUserMessage, lastAIResponse)
  } else {
    logger.debug('gameManager: Entering main game phase')
    return handleMainGame(gameState, lastUserMessage, lastAIResponse)
  }
}

async function handleGamemasterCommand(gameState: GameState, command: string): Promise<{ gameState: GameState; narratorResponse: string }> {
  logger.debug('handleGamemasterCommand: Processing command', { command })
  const updatedGameState = await generateAI('GAMEMASTER', { gameState, userMessage: command }) as unknown as GameState
  logger.debug('handleGamemasterCommand: Updated game state', JSON.stringify(updatedGameState, null, 2))
  return { gameState: updatedGameState, narratorResponse: "Game state updated as per your request." }
}

async function handleSetupPhase(gameState: GameState, userMessage: string, lastAIResponse: string): Promise<{ gameState: GameState; narratorResponse: string }> {
  logger.debug('handleSetupPhase: Starting setup phase', { currentAspect: gameState.setupPhase.currentAspect, aspectsCompleted: gameState.setupPhase.aspectsCompleted })

  if (!gameState.setupPhase.currentAspect) {
    gameState.setupPhase.currentAspect = 'worldAndLore'
  }

  const narratorResponse = await generateAI('SETUP_NARRATOR', { 
    gameState, 
    lastAIResponse,
    userMessage, 
    currentAspect: gameState.setupPhase.currentAspect 
  }) as string
  logger.debug('handleSetupPhase: Generated narrator response', { narratorResponse: narratorResponse.substring(0, 100) + '...' })
  
  const updatedGameState = await updateGameState(gameState, userMessage, narratorResponse)
  logger.debug('handleSetupPhase: Updated game state', JSON.stringify(updatedGameState, null, 2))
  
  const setupComplete = await isSetupComplete(updatedGameState)
  logger.debug('handleSetupPhase: Setup complete check', { setupComplete })
  
  if (setupComplete) {
    updatedGameState.setupPhase.completed = true
    const storySeed = await generateAI('STORY_SEED_GENERATOR', { gameState: updatedGameState }) as string
    logger.debug('handleSetupPhase: Setup completed, generated story seed', { storySeed: storySeed.substring(0, 100) + '...' })
    return { 
      gameState: updatedGameState, 
      narratorResponse: narratorResponse + "\n\nSetup complete! Your adventure begins:\n" + storySeed 
    }
  }
  
  logger.debug('handleSetupPhase: Setup phase continuing')
  return { gameState: updatedGameState, narratorResponse }
}

async function updateGameState(gameState: GameState, userMessage: string, narratorResponse: string): Promise<GameState> {
  logger.debug('updateGameState: Starting state update', { userMessage, narratorResponse: narratorResponse.substring(0, 100) + '...' })

  const aspectToUpdate = await generateAI('DETECTOR', { gameState, lastAIResponse: narratorResponse, lastUserMessage: userMessage }) as GameAspect | 'moveToNext'

  if (aspectToUpdate === 'moveToNext') {
    const aspects = Object.keys(GAME_ASPECTS) as GameAspect[]
    const currentIndex = aspects.indexOf(gameState.setupPhase.currentAspect as GameAspect)
    gameState.setupPhase.currentAspect = aspects[(currentIndex + 1) % aspects.length]
    gameState.setupPhase.aspectsCompleted.push(gameState.setupPhase.currentAspect as GameAspect)
    logger.debug('updateGameState: Moving to next aspect', { newAspect: gameState.setupPhase.currentAspect })
    return gameState
  }

  if (aspectToUpdate in GAME_ASPECTS) {
    logger.debug(`updateGameState: Updating aspect - ${aspectToUpdate}`)
    const result = await generateAI('ASPECT_UPDATER', { 
      aspect: aspectToUpdate, 
      lastAIResponse: narratorResponse, 
      lastUserMessage: userMessage,
      aspectState: gameState[aspectToUpdate]
    })
    logger.debug(`updateGameState: Aspect update result`, { aspect: aspectToUpdate, result })
    gameState[aspectToUpdate] = result as Record<string, any>
  }

  logger.debug('updateGameState: Updated game state', JSON.stringify(gameState, null, 2))
  return gameState
}

async function isSetupComplete(gameState: GameState): Promise<boolean> {
  const aspects = Object.keys(GAME_ASPECTS).join(', ')
  const completionResponse = await generateAI('SETUP_COMPLETE_CHECKER', { gameState, aspects }) as 'true' | 'false'
  const isComplete = completionResponse === 'true'
  logger.debug(`isSetupComplete: Setup complete check`, { isComplete, gameState: JSON.stringify(gameState, null, 2) })
  return isComplete
}

async function handleMainGame(gameState: GameState, lastUserMessage: string, lastAIResponse: string): Promise<{ gameState: GameState; narratorResponse: string }> {
  logger.debug('handleMainGame: Starting main game phase', { lastUserMessage, lastAIResponse: lastAIResponse.substring(0, 100) + '...' })

  gameState = await updateGameState(gameState, lastUserMessage, lastAIResponse)
  logger.debug('handleMainGame: Updated game state', JSON.stringify(gameState, null, 2))

  const narratorResponse = await generateAI('MAIN_GAME_NARRATOR', { gameState, lastUserMessage, lastAIResponse }) as string
  logger.debug('handleMainGame: Generated narrator response', { narratorResponse: narratorResponse.substring(0, 100) + '...' })

  return { gameState, narratorResponse }
}

function initializeGameState(previousGameState: Partial<GameState>): GameState {
  logger.debug('initializeGameState: Initializing game state', { previousGameState: JSON.stringify(previousGameState, null, 2) })
  
  return {
    worldAndLore: previousGameState.worldAndLore || {},
    charactersAndMechanics: previousGameState.charactersAndMechanics || {},
    questsAndProgression: previousGameState.questsAndProgression || {},
    setupPhase: previousGameState.setupPhase || { completed: false, currentAspect: null, aspectsCompleted: [] }
  } as GameState
}