import { generateObject } from 'ai'
import { LLM, DETECTOR_SCHEMA } from '@/lib/constants'
import logger from '@/lib/logger'

export async function detector(userMessage: string, aiResponse: string): Promise<any> {
  const result = await generateObject({
    model: LLM.DETECTOR.MODEL,
    prompt: `Detect which aspects of the game need updating based on the following AI response and user message:
    
    AI response: ${aiResponse}
    
    User message: ${userMessage}`,
    maxTokens: LLM.DETECTOR.MAX_TOKENS,
    temperature: LLM.DETECTOR.TEMP,
    schema: DETECTOR_SCHEMA,
  })

  logger.debug('detector.ts - detectedAspects:', result.object)

  return result
}