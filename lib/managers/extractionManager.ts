import { generateObject } from 'ai'
import logger from '@/lib/logger'
import { LLM, EXTRACTION_SCHEMA } from '@/lib/constants'

export async function extractionManager(userMessage: string, aiResponse: string): Promise<any> {

  const result = await generateObject({
    model: LLM.EXTRACTOR.MODEL,
    prompt: `Extract relevant information from the following AI response and user message:
    
    AI response: ${aiResponse}
    
    User message: ${userMessage}`,
    maxTokens: LLM.EXTRACTOR.MAX_TOKENS,
    temperature: LLM.EXTRACTOR.TEMP,
    schema: EXTRACTION_SCHEMA,
  })

  logger.debug('extractionManager.ts - extractedInfo:', result.object)

  return result.object
}