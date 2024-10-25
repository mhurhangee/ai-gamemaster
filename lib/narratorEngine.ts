import { generateText, CoreMessage } from 'ai'
import { LLM} from './constants'
import logger from './logger'

export async function narratorEngine(messages: CoreMessage[], /*gameManagerResponse*/): Promise<string> {
  logger.debug('narratorEngine.ts - messages:', messages)

  //turn gameManagerResponse into a usable format

  const result = await generateText({
    model: LLM.NARRATOR.MODEL,
    system: LLM.NARRATOR.SYSTEM /*+ gameState: gameManagerResponse + narrator:instructions*/,
    maxTokens: LLM.NARRATOR.MAX_TOKENS,
    temperature: LLM.NARRATOR.TEMP,
    messages: messages
  })

  logger.debug('narratorEngine.ts - result:', result.text)

  return result.text
}