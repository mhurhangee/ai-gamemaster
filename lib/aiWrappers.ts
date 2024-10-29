// aiWrappers.ts

import { generateObject, generateText } from 'ai'
import { LLM } from './constants'
import logger from './logger'

type LLMKey = keyof typeof LLM

export async function generateAI(key: LLMKey, promptVars: Record<string, any>) {
  const config = LLM[key]
  let prompt = config.PROMPT

  // Replace variables in the prompt
  for (const [varName, varValue] of Object.entries(promptVars)) {
    prompt = prompt.replace(`{{${varName}}}`, JSON.stringify(varValue))
  }

  logger.debug(`generateAI: Generating AI response for ${key}`, { promptVars })

  let result;
  if (config.OUTPUT === 'enum') {
    const { object } = await generateObject({
      model: config.MODEL,
      output: 'enum',
      enum: config.ENUM,
      prompt: config.SYSTEM + '\n\n' + prompt,
      maxTokens: config.MAX_TOKENS,
      temperature: config.TEMP,
    })
    result = object;
  } else if (config.TEMP <= 0.2) {
    const { object } = await generateObject({
      model: config.MODEL,
      output: 'no-schema',
      prompt: config.SYSTEM + '\n\n' + prompt,
      maxTokens: config.MAX_TOKENS,
      temperature: config.TEMP,
    })
    result = object;
  } else {
    const { text } = await generateText({
      model: config.MODEL,
      prompt: config.SYSTEM + '\n\n' + prompt,
      maxTokens: config.MAX_TOKENS,
      temperature: config.TEMP,
    })
    result = text;
  }

  logger.debug(`generateAI: Generated AI response for ${key}`, { result: JSON.stringify(result).substring(0, 100) + '...' })
  return result;
}