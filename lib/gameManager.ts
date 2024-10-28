import { CoreMessage, generateObject } from 'ai'
import { MANAGER_CONFIGS, LLM, DETECTOR_SCHEMA, GameAspect } from './constants'
import logger from './logger'
import { GameState } from '@/types/GameState'

export async function gameManager(messages: CoreMessage[], previousGameState: Partial<GameState>): Promise<{ gameState: GameState; narratorInstructions: string }> {
  logger.debug('gameManager.ts - messages:', messages)
  logger.debug('gameManager.ts - previousGameState:', previousGameState)

  const lastUserMessage = messages[messages.length - 1].content
  const lastAIResponse = messages.length > 1 ? messages[messages.length - 2].content : ''

  const gameState: GameState = {
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
    setupPhase: previousGameState.setupPhase || { completed: false, currentAspect: null }
  } as GameState

  if (!gameState.setupPhase.completed) {
    return handleSetupPhase(gameState, typeof lastUserMessage === 'string' ? lastUserMessage : JSON.stringify(lastUserMessage))
  }

  const { object: detectedAspects } = await generateObject({
    model: LLM.DETECTOR.MODEL,
    schema: DETECTOR_SCHEMA,
    prompt: `Detect which aspects of the game need updating based on the following AI response and user message:

AI response: ${typeof lastAIResponse === 'string' ? lastAIResponse : JSON.stringify(lastAIResponse)}

User message: ${typeof lastUserMessage === 'string' ? lastUserMessage : JSON.stringify(lastUserMessage)}`,
    maxTokens: LLM.DETECTOR.MAX_TOKENS,
    temperature: LLM.DETECTOR.TEMP,
  })

  logger.debug('gameManager.ts - detectedAspects:', detectedAspects)

  const updatedAspects: GameAspect[] = []

  for (const [aspect, needsUpdate] of Object.entries(detectedAspects)) {
    if (needsUpdate && aspect in MANAGER_CONFIGS) {
      const config = MANAGER_CONFIGS[aspect as GameAspect];
      logger.debug(`gameManager.ts - Updating aspect: ${aspect}`)
      const { object: result } = await generateObject({
        model: LLM.DETECTOR.MODEL,
        output: 'no-schema',
        prompt: `${config.PROMPT}\n\nAI response: ${typeof lastAIResponse === 'string' ? lastAIResponse : JSON.stringify(lastAIResponse)}\n\nUser message: ${typeof lastUserMessage === 'string' ? lastUserMessage : JSON.stringify(lastUserMessage)}`,
        maxTokens: LLM.DETECTOR.MAX_TOKENS,
        temperature: LLM.DETECTOR.TEMP,
      })

      logger.debug(`gameManager.ts - updatedAspect: ${aspect}`)
      logger.debug(`gameManager.ts - result:`, result)
      
      gameState[aspect as GameAspect] = result as Record<string, any>
      updatedAspects.push(aspect as GameAspect)
    }
  }

  const narratorInstructions = generateNarratorInstructions(gameState, updatedAspects)

  logger.debug('gameManager.ts - updatedGameState:', gameState)
  logger.debug('gameManager.ts - narratorInstructions:', narratorInstructions)

  return { gameState, narratorInstructions }
}

async function handleSetupPhase(gameState: GameState, userMessage: string): Promise<{ gameState: GameState; narratorInstructions: string }> {
  const aspects = Object.keys(MANAGER_CONFIGS) as GameAspect[]
  let currentAspectIndex = aspects.indexOf(gameState.setupPhase.currentAspect || aspects[0])

  if (currentAspectIndex === -1) {
    currentAspectIndex = 0
  }

  const currentAspect = aspects[currentAspectIndex]
  const config = MANAGER_CONFIGS[currentAspect]

  const { object: result } = await generateObject({
    model: LLM.DETECTOR.MODEL,
    output: 'no-schema',
    prompt: `${config.PROMPT}\n\nUser input: ${userMessage}`,
    maxTokens: LLM.DETECTOR.MAX_TOKENS,
    temperature: LLM.DETECTOR.TEMP,
  })

  gameState[currentAspect] = result as Record<string, any>

  currentAspectIndex++
  if (currentAspectIndex >= aspects.length) {
    gameState.setupPhase.completed = true
    gameState.setupPhase.currentAspect = null
  } else {
    gameState.setupPhase.currentAspect = aspects[currentAspectIndex]
  }

  const narratorInstructions = gameState.setupPhase.completed
    ? 'The setup phase is complete. Introduce the world and begin the main narrative.'
    : `Ask the user about their preferences for the ${aspects[currentAspectIndex]} aspect. Provide options or suggestions based on what has been established so far.`

  return { gameState, narratorInstructions }
}

function generateNarratorInstructions(gameState: GameState, updatedAspects: GameAspect[]): string {
  let instructions = ''

  if (updatedAspects.length > 0) {
    const formattedAspects = updatedAspects.map(aspect => aspect.split(/(?=[A-Z])/).join(' '))
    instructions += `The following aspects have been updated: ${formattedAspects.join(', ')}. `
    instructions += 'Incorporate these updates into your narrative and explain how they affect the game world or the player\'s options. '
  }

  instructions += 'Based on the current game state and any updates, provide an engaging narrative response that moves the story forward. '
  instructions += 'Always maintain consistency with previously established elements of the game world and characters. '
  instructions += 'If the user\'s input contradicts existing information, find creative ways to reconcile the differences or explain the changes in-world. '

  for (const [aspect, state] of Object.entries(gameState)) {
    if (aspect !== 'setupPhase' && Object.keys(state).length > 0) {
      instructions += `For ${aspect.split(/(?=[A-Z])/).join(' ')}, consider the current state: ${JSON.stringify(state)}. `
    }
  }

  instructions += 'Remember to balance providing information with asking for user input to keep the interaction engaging and collaborative. '

  return instructions
}