import { NextRequest } from 'next/server'
import { gameManager } from '@/lib/gameManager'
//import logger from '@/lib/logger'

export async function POST(req: NextRequest) {
  const { messages, gameState } = await req.json()

  const { gameState: updatedGameState, narratorResponse } = await gameManager(messages, gameState)
  
  //logger.debug('game-engine.ts - updatedGameState:', updatedGameState)
  //logger.debug('game-engine.ts - narratorResponse:', narratorResponse.slice(0, 25), '...')

  return Response.json({ narratorResponse, gameState: updatedGameState })
}