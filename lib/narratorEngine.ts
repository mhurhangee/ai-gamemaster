import { generateText, CoreMessage } from 'ai'
import { LLM } from './constants'
import logger from './logger'

export async function narratorEngine(messages: CoreMessage[], gameManagerResponse: any): Promise<string> {
  //logger.debug('narratorEngine.ts - messages:', messages)

  const { narratorInstructions } = gameManagerResponse

  logger.debug("narratorEngine.ts - narratorInstructions:", narratorInstructions)

  const result = await generateText({
    model: LLM.NARRATOR.MODEL,
    system: LLM.NARRATOR.SYSTEM + narratorInstructions,
    maxTokens: LLM.NARRATOR.MAX_TOKENS,
    temperature: LLM.NARRATOR.TEMP,
    messages: messages
  })

  logger.debug('narratorEngine.ts - result:', result.text.slice(0, 25), '...')

  return result.text
}