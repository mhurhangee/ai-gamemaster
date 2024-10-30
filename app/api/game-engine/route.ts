import { NextRequest } from 'next/server'
import { gameManager } from '@/lib/gameManager'

export async function POST(req: NextRequest) {
  const { messages, gameState } = await req.json()

  const { gameState: updatedGameState, narratorResponse } = await gameManager(messages, gameState)

  return Response.json({ narratorResponse, gameState: updatedGameState })
}