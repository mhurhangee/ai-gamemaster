import { NextRequest } from 'next/server'
import { narratorEngine } from '@/lib/narratorEngine'
import logger from '@/lib/logger'

export async function POST(req: NextRequest) {
  const { messages/*,previous gameState*/  } = await req.json()
  logger.info('route.ts - messages:', messages)

  //I wanted to include a gameManager
  //const gameManagerResponse = await gameManager(messages, previousGameState)
  //logger.info('route.ts - gameManagerResponse:', gameManagerResponse)

  const narratorResponse = await narratorEngine(messages /*, gameManagerResponse*/)
  logger.info('route.ts - narratorResponse:', narratorResponse)

  return Response.json({ content: narratorResponse/*, gameState: gameManagerResponse*/ })
}