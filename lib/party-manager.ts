import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { GameState, Party } from '@/types/game-state'

const characterSchema = z.object({
  name: z.string(),
  description: z.string(),
  stats: z.record(z.number()),
  skills: z.array(z.string()),
  inventory: z.array(z.string()),
})

export const createCharacter = async (description: string): Promise<z.infer<typeof characterSchema>> => {
  const character = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: characterSchema,
    prompt: `Create a character based on this description: "${description}"

    Generate a name, description, stats, skills, and inventory for the character.`,
  });

  // Validate the generated character
  const validatedCharacter = characterSchema.parse(character.object);

  return validatedCharacter;
};

export const updateParty = async (party: Party, gameState: GameState, event: string): Promise<Party> => {
  const updatedParty = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: z.array(characterSchema),
    prompt: `Update the party based on the current game state and the recent event.

Current Party:
${JSON.stringify(party, null, 2)}

Current Game State:
${JSON.stringify(gameState, null, 2)}

Recent Event:
${event}

Provide an updated party array, modifying character stats, skills, or inventory as necessary.`,
  })

  return updatedParty.object
}