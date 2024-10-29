import { CoreMessage, generateObject } from 'ai'
import { MANAGER_CONFIGS, LLM, DETECTOR_SCHEMA, GameAspect } from './constants'
import { GameState } from './types'
import { setupNarrator } from './setupNarrator'
import { mainGameNarrator } from './mainGameNarrator'
import logger from './logger'

export async function gameManager(messages: CoreMessage[], previousGameState: Partial<GameState>): Promise<{ gameState: GameState; narratorResponse: string }> {
  logger.debug('gameManager.ts - messages:', messages.slice(-2))
  logger.debug('gameManager.ts - previousGameState:', JSON.stringify(previousGameState, null, 2))

  const lastUserMessage = String(messages[messages.length - 1].content)
  const lastAIResponse = messages.length > 1 ? String(messages[messages.length - 2].content) : ''

  const gameState: GameState = initializeGameState(previousGameState)

  if (!gameState.setupPhase.completed) {
    return handleSetupPhase(gameState, lastUserMessage)
  }

  return handleMainGame(gameState, lastUserMessage, lastAIResponse)
}

function initializeGameState(previousGameState: Partial<GameState>): GameState {
  return {
    ...previousGameState,
    loreAndWorldbuilding: previousGameState.loreAndWorldbuilding || {},
    rulesAndMechanics: previousGameState.rulesAndMechanics || {},
    charactersAndParties: previousGameState.charactersAndParties || {},
    questsAndObjectives: previousGameState.questsAndObjectives || {},
    inventoryAndResources: previousGameState.inventoryAndResources || {},
    dialogueAndInteraction: previousGameState.dialogueAndInteraction || {},
    environmentAndExploration: previousGameState.environmentAndExploration || {},
    combatAndEncounters: previousGameState.combatAndEncounters || {},
    progressionAndSkills: previousGameState.progressionAndSkills || {},
    economyAndTrading: previousGameState.economyAndTrading || {},
    settingsAndOptions: previousGameState.settingsAndOptions || {},
    setupPhase: previousGameState.setupPhase || { completed: false, currentAspect: null, aspectsCompleted: [] }
  } as GameState
}

async function handleSetupPhase(gameState: GameState, userMessage: string): Promise<{ gameState: GameState; narratorResponse: string }> {
  const aspects = Object.keys(MANAGER_CONFIGS) as GameAspect[]
  let currentAspect = gameState.setupPhase.currentAspect || aspects[0]

  logger.debug(`handleSetupPhase - Current aspect: ${currentAspect}`)

  const { narratorResponse, aspectComplete } = await setupNarrator(currentAspect, userMessage, gameState[currentAspect])

  if (aspectComplete) {
    gameState.setupPhase.aspectsCompleted.push(currentAspect)
    const nextAspectIndex = aspects.findIndex(aspect => !gameState.setupPhase.aspectsCompleted.includes(aspect))
    
    if (nextAspectIndex === -1) {
      gameState.setupPhase.completed = true
      gameState.setupPhase.currentAspect = null
      logger.info('Setup phase completed')
    } else {
      currentAspect = aspects[nextAspectIndex]
      gameState.setupPhase.currentAspect = currentAspect
      logger.info(`Moving to next aspect: ${currentAspect}`)
    }
  }

  logger.debug(`handleSetupPhase - Updated game state:`, JSON.stringify(gameState, null, 2))

  return { gameState, narratorResponse }
}

async function handleMainGame(gameState: GameState, lastUserMessage: string, lastAIResponse: string): Promise<{ gameState: GameState; narratorResponse: string }> {
  const { object: detectedAspects } = await generateObject({
    model: LLM.DETECTOR.MODEL,
    schema: DETECTOR_SCHEMA,
    prompt: `Detect which aspects of the game need updating based on the following AI response and user message:

AI response: ${lastAIResponse}

User message: ${lastUserMessage}`,
    maxTokens: LLM.DETECTOR.MAX_TOKENS,
    temperature: LLM.DETECTOR.TEMP,
  })

  logger.debug('handleMainGame - detectedAspects:', detectedAspects)

  const updatedAspects: GameAspect[] = []

  for (const [aspect, needsUpdate] of Object.entries(detectedAspects)) {
    if (needsUpdate && aspect in MANAGER_CONFIGS) {
      const config = MANAGER_CONFIGS[aspect as GameAspect];
      logger.debug(`Updating aspect: ${aspect}`)
      const { object: result } = await generateObject({
        model: LLM.DETECTOR.MODEL,
        output: 'no-schema',
        prompt: `${config.PROMPT}\n\nAI response: ${lastAIResponse}\n\nUser message: ${lastUserMessage}`,
        maxTokens: LLM.DETECTOR.MAX_TOKENS,
        temperature: LLM.DETECTOR.TEMP,
      })

      logger.debug(`Updated aspect ${aspect}:`, JSON.stringify(result, null, 2))
      
      gameState[aspect as GameAspect] = result as Record<string, any>
      updatedAspects.push(aspect as GameAspect)
    }
  }

  const narratorResponse = await mainGameNarrator(lastUserMessage, gameState, updatedAspects)

  logger.debug('handleMainGame - Updated game state:', JSON.stringify(gameState, null, 2))

  return { gameState, narratorResponse }
}