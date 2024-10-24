import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { GameState, WorldState } from '@/types/game-state'

const worldStateSchema = z.object({
  locations: z.record(z.object({
    name: z.string(),
    description: z.string(),
    characters: z.array(z.string()),
    items: z.array(z.string()),
  })),
  time: z.string(),
  weather: z.string(),
  events: z.array(z.string()),
})

export const updateWorldState = async (currentState: WorldState, gameState: GameState, playerActions: string[]): Promise<WorldState> => {
  const updatedWorldState = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: worldStateSchema,
    prompt: `Update the world state based on the current game state and recent player actions.

Current World State:
${JSON.stringify(currentState, null, 2)}

Current Game State:
${JSON.stringify(gameState, null, 2)}

Recent Player Actions:
${JSON.stringify(playerActions, null, 2)}

Provide an updated world state, modifying locations, time, weather, and events as necessary.`,
  })

  return updatedWorldState.object
}