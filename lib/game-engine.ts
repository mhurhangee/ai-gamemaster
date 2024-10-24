import { GameState, Character } from '@/types/game-state'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { extractLore, updateGameLore } from './game-lore-keeper'

const gameStateUpdateSchema = z.object({
  currentLocation: z.string(),
  party: z.array(z.object({
    name: z.string(),
    description: z.string(),
    stats: z.record(z.number()),
    skills: z.array(z.string()),
    inventory: z.array(z.string()),
  })),
  inventory: z.array(z.object({
    name: z.string(),
    description: z.string(),
    quantity: z.number(),
  })),
  questLog: z.array(z.object({
    title: z.string(),
    description: z.string(),
    status: z.enum(['active', 'completed', 'failed']),
  })),
})

export const processGameAction = async (gameState: GameState, userAction: string, aiResponse: string): Promise<GameState> => {
  // Deep clone the current game state
  const currentState = JSON.parse(JSON.stringify(gameState));

  // Extract lore from the AI response
  const extractedLore = await extractLore(aiResponse);

  // Update the game lore
  const updatedLore = await updateGameLore(currentState.gameLore, extractedLore);

  // Generate updated game state based on user action and AI response
  const updatedState = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: gameStateUpdateSchema,
    prompt: `Given the current game state, user action, and AI response, generate an updated game state.

    Current Game State:
    ${JSON.stringify(currentState, null, 2)}

    User Action:
    ${userAction}

    AI Response:
    ${aiResponse}

    Provide an updated game state object.`,
  });

  return {
    ...currentState,
    ...updatedState.object,
    gameLore: updatedLore,
  };
};