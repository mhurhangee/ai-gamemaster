import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import logger from '@/lib/logger'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    logger.info('Received POST request to test-openai route', { messages })

    logger.info('Calling OpenAI API')
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      messages: messages.map((message: any) => ({
        role: message.role,
        content: message.content,
      })),
    })

    const aiResponse = await result.text
    logger.info('Full OpenAI response', { aiResponse })

    // Return a properly formatted JSON response
    return NextResponse.json({
      messages: [
        ...messages,
        { role: 'assistant', content: aiResponse }
      ],
      gameState: {
        // Include a minimal game state for now
        currentLocation: 'start',
        party: [],
        inventory: [],
        questLog: [],
      }
    })
  } catch (error) {
    logger.error('Error in test-openai route:', error, { stack: error })
    return NextResponse.json({ error: 'An unexpected error occurred', details: error }, { status: 500 })
  }
}