import { NextRequest, NextResponse } from 'next/server'
import { saveGame } from '@/lib/save-load-manager'

export async function POST(req: NextRequest) {
  const { gameState } = await req.json()
  const saveCode = await saveGame(gameState)
  return NextResponse.json({ saveCode })
}