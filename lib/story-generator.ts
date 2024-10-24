"use server"

import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { GameState } from '@/types/game-state'

const storyEventSchema = z.object({
  narrative: z.string(),
  choices: z.array(z.string()),
  consequences: z.array(z.string()),
})

export const generateStoryEvent = async (gameState: GameState, userAction: string): Promise<z.infer<typeof storyEventSchema>> => {
  const storyEvent = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: storyEventSchema,
    prompt: `Given the current game state and user action, generate the next story event.

    Current Game State:
    ${JSON.stringify(gameState, null, 2)}

    User Action:
    ${userAction}

    Consider the current location, party composition, quest log, and recent events when generating the narrative.
    Ensure the choices are relevant to the current situation and align with the game's lore.
    Generate a narrative description, a list of possible choices for the player, and potential consequences for each choice.`,
  });

  return storyEvent.object;
};