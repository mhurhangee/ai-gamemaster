import { GameLore } from '@/types/game-state'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'

export const initializeGameLore = (): GameLore => {
  return {
    rules: [],
    worldFacts: [],
    characters: [],
  }
}

const extractLoreSchema = z.object({
  rules: z.array(z.string()),
  worldFacts: z.array(z.string()),
  characters: z.array(z.string()),
})

export const extractLore = async (message: string): Promise<GameLore> => {
  const extractedLore = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: extractLoreSchema,
    prompt: `Extract game lore from the following message. Identify any rules, world facts, or character information:

${message}

Respond with a JSON object containing arrays for 'rules', 'worldFacts', and 'characters'.`,
  })

  return extractedLore.object
}

export const updateGameLore = async (currentLore: GameLore, newLore: Partial<GameLore>): Promise<GameLore> => {
  const mergedLore = {
    rules: [...new Set([...currentLore.rules, ...(newLore.rules || [])])],
    worldFacts: [...new Set([...currentLore.worldFacts, ...(newLore.worldFacts || [])])],
    characters: [...new Set([...currentLore.characters, ...(newLore.characters || [])])],
  };

  const updatedLore = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: extractLoreSchema,
    prompt: `Update the current game lore with new information. Resolve any conflicts and maintain consistency.

    Current Lore:
    ${JSON.stringify(mergedLore, null, 2)}

    Provide an updated lore object.`,
  });

  return updatedLore.object;
};