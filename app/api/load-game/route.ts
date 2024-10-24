import { NextRequest, NextResponse } from 'next/server'
import { loadGame } from '@/lib/save-load-manager'

export async function POST(req: NextRequest) {
  const { saveCode } = await req.json()
  const gameState = await loadGame(saveCode)
  if (gameState) {
    return NextResponse.json({ gameState })
  } else {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  }
}