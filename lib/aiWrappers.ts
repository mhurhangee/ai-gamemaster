import { generateObject, generateText, CoreMessage } from 'ai'
import { LLM } from './constants'
import logger from './utils'

type LLMKey = keyof typeof LLM

export async function generateAI(key: LLMKey, promptVars: Record<string, any>, messages: CoreMessage[]) {
  const config = LLM[key]
  let systemPrompt = config.SYSTEM + '\n\n' + config.PROMPT

  // Replace variables in the system prompt
  for (const [varName, varValue] of Object.entries(promptVars)) {
    systemPrompt = systemPrompt.replace(`{{${varName}}}`, JSON.stringify(varValue))
  }

  // Extract lastAIResponse and userMessage from messages if they exist
  const lastAIResponse = messages.length > 1 ? messages[messages.length - 2].content : ''
  const userMessage = messages.length > 0 ? messages[messages.length - 1].content : ''

  // Replace lastAIResponse and userMessage in the system prompt
  systemPrompt = systemPrompt.replace('{{lastAIResponse}}', JSON.stringify(lastAIResponse))
  systemPrompt = systemPrompt.replace('{{userMessage}}', JSON.stringify(userMessage))

  logger.debug(`generateAI: Generating AI response for ${key}`, { promptVars })

  let result;
  if (config.OUTPUT === 'enum') {
    const { object } = await generateObject({
      model: config.MODEL,
      output: 'enum',
      enum: config.ENUM,
      system: systemPrompt,
      messages: messages,
      maxTokens: config.MAX_TOKENS,
      temperature: config.TEMP,
    })
    result = object;
  } else if (config.TEMP <= 0.2) {
    const { object } = await generateObject({
      model: config.MODEL,
      output: 'no-schema',
      system: systemPrompt,
      messages: messages,
      maxTokens: config.MAX_TOKENS,
      temperature: config.TEMP,
    })
    result = object;
  } else {
    const { text } = await generateText({
      model: config.MODEL,
      system: systemPrompt,
      messages: messages,
      maxTokens: config.MAX_TOKENS,
      temperature: config.TEMP,
    })
    result = text;
  }

  logger.debug(`generateAI: Generated AI response for ${key}`, { result: JSON.stringify(result).substring(0, 100) + '...' })
  return result;
}