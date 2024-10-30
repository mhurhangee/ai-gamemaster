// gameManager.ts

import { CoreMessage } from 'ai'
import { CORE_ASPECTS, GAME_ASPECTS, CoreAspect, GameAspect } from './constants'
import { GameState } from './types'
import { generateAI } from './aiWrappers'
import logger from './logger'

const MESSAGE_HISTORY_LENGTH = 5

export async function gameManager(messages: CoreMessage[], previousGameState: Partial<GameState>): Promise<{ gameState: GameState; narratorResponse: string }> {
  const gameState: GameState = initializeGameState(previousGameState)
  logger.debug('gameManager: Initial game state', JSON.stringify(gameState, null, 2))
  
  const recentMessages = messages.slice(-MESSAGE_HISTORY_LENGTH)
  const lastUserMessage = String(messages[messages.length - 1].content)

  if (lastUserMessage.startsWith('@')) {
    return handleGamemasterCommand(gameState, lastUserMessage.slice(1), recentMessages)
  }

  if (!gameState.setupPhase.completed) {
    logger.debug('gameManager: Entering setup phase')
    return handleSetupPhase(gameState, recentMessages)
  } else {
    logger.debug('gameManager: Entering main game phase')
    return handleMainGame(gameState, recentMessages)
  }
}

async function handleGamemasterCommand(gameState: GameState, command: string, recentMessages: CoreMessage[]): Promise<{ gameState: GameState; narratorResponse: string }> {
  logger.debug('handleGamemasterCommand: Processing command', { command })
  const updatedGameState = await generateAI('GAMEMASTER', { gameState, userMessage: command }, recentMessages) as unknown as GameState
  logger.debug('handleGamemasterCommand: Updated game state', JSON.stringify(updatedGameState, null, 2))
  return { gameState: updatedGameState, narratorResponse: "Game state updated as per your request." }
}

async function handleSetupPhase(gameState: GameState, recentMessages: CoreMessage[]): Promise<{ gameState: GameState; narratorResponse: string }> {
  logger.debug('handleSetupPhase: Starting setup phase', { currentAspect: gameState.setupPhase.currentAspect, aspectsCompleted: gameState.setupPhase.aspectsCompleted })

  if (!gameState.setupPhase.currentAspect) {
    gameState.setupPhase.currentAspect = 'genre'
  }

  const narratorResponse = await generateAI('SETUP_NARRATOR', { 
    gameState, 
    currentAspect: gameState.setupPhase.currentAspect 
  }, recentMessages) as string
  logger.debug('handleSetupPhase: Generated narrator response', { narratorResponse: narratorResponse.substring(0, 100) + '...' })
  
  const updatedGameState = await updateGameState(gameState, recentMessages, true)
  logger.debug('handleSetupPhase: Updated game state', JSON.stringify(updatedGameState, null, 2))
  
  const setupComplete = await isSetupComplete(updatedGameState, recentMessages)
  logger.debug('handleSetupPhase: Setup complete check', { setupComplete })
  
  if (setupComplete) {
    updatedGameState.setupPhase.completed = true
    const storySeed = await generateAI('STORY_SEED_GENERATOR', { gameState: updatedGameState }, recentMessages) as string
    logger.debug('handleSetupPhase: Setup completed, generated story seed', { storySeed: storySeed.substring(0, 100) + '...' })
    return { 
      gameState: updatedGameState, 
      narratorResponse: narratorResponse + "\n\nSetup complete! Your adventure begins:\n" + storySeed 
    }
  }
  
  logger.debug('handleSetupPhase: Setup phase continuing')
  return { gameState: updatedGameState, narratorResponse }
}

async function updateGameState(gameState: GameState, recentMessages: CoreMessage[], isSetupPhase: boolean): Promise<GameState> {
  logger.debug('updateGameState: Starting state update', { isSetupPhase })

  const aspectToUpdate = await generateAI('DETECTOR', { gameState, isSetupPhase, lastAIResponse: recentMessages[recentMessages.length - 2]?.content, userMessage: recentMessages[recentMessages.length - 1]?.content }, recentMessages) as CoreAspect | GameAspect | 'moveToNext'

  logger.debug('updateGameState: Aspect to update', { aspectToUpdate })

  if (aspectToUpdate === 'moveToNext') {
    if (isSetupPhase) {
      const coreAspects = Object.keys(CORE_ASPECTS) as CoreAspect[]
      const gameAspects = Object.keys(GAME_ASPECTS) as GameAspect[]
      const allAspects = [...coreAspects, ...gameAspects]
      const currentIndex = allAspects.indexOf(gameState.setupPhase.currentAspect as CoreAspect | GameAspect)
      gameState.setupPhase.currentAspect = allAspects[(currentIndex + 1) % allAspects.length]
      gameState.setupPhase.aspectsCompleted.push(gameState.setupPhase.currentAspect)
      logger.debug('updateGameState: Moving to next aspect', { newAspect: gameState.setupPhase.currentAspect })
    }
    return gameState
  }

  if (isSetupPhase && aspectToUpdate in CORE_ASPECTS) {
    logger.debug(`updateGameState: Updating core aspect - ${aspectToUpdate}`)
    const result = await generateAI('ASPECT_UPDATER', { 
      aspect: aspectToUpdate, 
      aspectState: gameState.coreAspects[aspectToUpdate as CoreAspect]
    }, recentMessages)
    logger.debug(`updateGameState: Core aspect update result`, { aspect: aspectToUpdate, result })
    gameState.coreAspects[aspectToUpdate as CoreAspect] = result as string
  } else if (aspectToUpdate in GAME_ASPECTS) {
    logger.debug(`updateGameState: Updating game aspect - ${aspectToUpdate}`)
    const result = await generateAI('ASPECT_UPDATER', { 
      aspect: aspectToUpdate, 
      aspectState: gameState.gameAspects[aspectToUpdate as GameAspect]
    }, recentMessages)
    logger.debug(`updateGameState: Game aspect update result`, { aspect: aspectToUpdate, result })
    gameState.gameAspects[aspectToUpdate as GameAspect] = result as Record<string, any>
  }

  logger.debug('updateGameState: Updated game state', JSON.stringify(gameState, null, 2))
  return gameState
}

async function isSetupComplete(gameState: GameState, recentMessages: CoreMessage[]): Promise<boolean> {
  logger.debug('isSetupComplete: Checking if setup is complete', { gameStateKeys: Object.keys(gameState) })

  const completionResponse = await generateAI('SETUP_COMPLETE_CHECKER', { 
    gameState
  }, recentMessages) as 'true' | 'false'
  
  const isComplete = completionResponse === 'true'
  logger.debug('isSetupComplete: Setup complete check result', { 
    isComplete, 
    gameStateKeys: Object.keys(gameState)
  })

  return isComplete
}

async function handleMainGame(gameState: GameState, recentMessages: CoreMessage[]): Promise<{ gameState: GameState; narratorResponse: string }> {
  logger.debug('handleMainGame: Starting main game phase')

  gameState = await updateGameState(gameState, recentMessages, false)
  logger.debug('handleMainGame: Updated game state', JSON.stringify(gameState, null, 2))

  const narratorResponse = await generateAI('MAIN_GAME_NARRATOR', { gameState }, recentMessages) as string
  logger.debug('handleMainGame: Generated narrator response', { narratorResponse: narratorResponse.substring(0, 100) + '...' })

  return { gameState, narratorResponse }
}

function initializeGameState(previousGameState: Partial<GameState>): GameState {
  logger.debug('initializeGameState: Initializing game state', { previousGameState: JSON.stringify(previousGameState, null, 2) })
  
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