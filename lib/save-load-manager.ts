import { Redis } from '@upstash/redis'
import { GameState } from '@/types/game-state'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const generateUniqueCode = () => {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 7)
  return `${timestamp}-${randomStr}`
}

export const saveGame = async (gameState: GameState): Promise<string> => {
  const uniqueCode = generateUniqueCode()
  await redis.set(`game:${uniqueCode}`, JSON.stringify(gameState), { ex: 2592000 }) // 30 days expiry
  return uniqueCode
}

export const loadGame = async (uniqueCode: string): Promise<GameState | null> => {
  const savedGame = await redis.get(`game:${uniqueCode}`)
  return savedGame ? JSON.parse(savedGame as string) : null
}