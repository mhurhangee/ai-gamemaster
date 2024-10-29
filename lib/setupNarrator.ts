import { generateText } from 'ai'
import { LLM, GameAspect } from './constants'
import logger from './logger'

export async function setupNarrator(currentAspect: GameAspect, userMessage: string, currentAspectState: Record<string, any>): Promise<{ narratorResponse: string; aspectComplete: boolean }> {
  logger.debug(`setupNarrator.ts - currentAspect: ${currentAspect}`)
  logger.debug(`setupNarrator.ts - currentAspectState:`, JSON.stringify(currentAspectState, null, 2))

  const instructions = `Focus on setting up the ${currentAspect} aspect of the game. 
  Current state: ${JSON.stringify(currentAspectState)}.
  Provide options and ask for more details if needed. If the aspect is sufficiently detailed, indicate that this aspect is complete.`

  const result = await generateText({
    model: LLM.SETUP_NARRATOR.MODEL,
    system: LLM.SETUP_NARRATOR.SYSTEM + instructions,
    maxTokens: LLM.SETUP_NARRATOR.MAX_TOKENS,
    temperature: LLM.SETUP_NARRATOR.TEMP,
    messages: [{ role: 'user', content: userMessage }]
  })

  const narratorResponse = result.text
  const aspectComplete = narratorResponse.toLowerCase().includes("aspect complete") || narratorResponse.toLowerCase().includes("moving to next aspect")

  logger.debug(`setupNarrator.ts - narratorResponse: ${narratorResponse.slice(0, 50)}...`)
  logger.debug(`setupNarrator.ts - aspectComplete: ${aspectComplete}`)

  return { narratorResponse, aspectComplete }
}