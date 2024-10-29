import { generateText } from 'ai'
import { LLM, GameAspect } from './constants'
import { GameState } from '@/lib/types'
import logger from './logger'

export async function mainGameNarrator(lastUserMessage: string, gameState: GameState, updatedAspects: GameAspect[]): Promise<string> {
  const instructions = generateNarratorInstructions(gameState, updatedAspects)

  logger.debug("mainGameNarrator.ts - instructions:", instructions)

  const result = await generateText({
    model: LLM.MAIN_GAME_NARRATOR.MODEL,
    system: LLM.MAIN_GAME_NARRATOR.SYSTEM + instructions,
    maxTokens: LLM.MAIN_GAME_NARRATOR.MAX_TOKENS,
    temperature: LLM.MAIN_GAME_NARRATOR.TEMP,
    messages: [{ role: 'user', content: lastUserMessage }]
  })

  logger.debug('mainGameNarrator.ts - result:', result.text.slice(0, 25), '...')

  return result.text
}

function generateNarratorInstructions(gameState: GameState, updatedAspects: GameAspect[]): string {
  let instructions = ''

  if (updatedAspects.length > 0) {
    const formattedAspects = updatedAspects.map(aspect => aspect.split(/(?=[A-Z])/).join(' '))
    instructions += `The following aspects have been updated: ${formattedAspects.join(', ')}. `
    instructions += 'Incorporate these updates into your narrative and explain how they affect the game world or the player\'s options. '
  }

  for (const [aspect, state] of Object.entries(gameState)) {
    if (aspect !== 'setupPhase' && Object.keys(state).length > 0) {
      instructions += `For ${aspect.split(/(?=[A-Z])/).join(' ')}, consider the current state: ${JSON.stringify(state)}. `
    }
  }

  return instructions
}