import { NextRequest } from 'next/server'
import { narratorEngine } from '@/lib/narratorEngine'
import { gameManager } from '@/lib/gameManager'
import logger from '@/lib/logger'

export async function POST(req: NextRequest) {
  const { messages, gameState } = await req.json()
  //logger.info('route.ts - messages:', messages)

  const gameManagerResponse = await gameManager(messages, gameState)
  //logger.info('route.ts - gameManagerResponse:', gameManagerResponse)

  const narratorResponse = await narratorEngine(messages, gameManagerResponse)
  //logger.info('route.ts - narratorResponse:', narratorResponse.slice(0,25), '...')

  return Response.json({ content: narratorResponse, gameState: gameManagerResponse.gameState })
}