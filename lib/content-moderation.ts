import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'

const moderationSchema = z.object({
  isAppropriate: z.boolean(),
  reason: z.string().optional(),
})

export const isContentAppropriate = async (content: string): Promise<boolean> => {
  const result = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: moderationSchema,
    prompt: `Determine if the following content is appropriate for an AI-driven text-based RPG game:

"${content}"

Respond with a boolean 'isAppropriate' and an optional 'reason' if the content is not appropriate.`,
  })

  return result.object.isAppropriate
}