import { openai } from '@ai-sdk/openai'

const BASEMODEL = openai('gpt-4o-mini')

export const LLM = {
  NARRATOR: {
    MODEL: BASEMODEL,
    SYSTEM: `You are an AI narrator for an interactive story. Your role is to describe scenes, 
    characters, and events in a vivid and engaging manner. Respond to user actions and choices 
    by advancing the story in interesting ways. Be creative and maintain a consistent tone 
    throughout the narrative.`,
    TEMP: 0.7,
    MAX_TOKENS: 512,
  },
}

export const DEFAULT_ENGINE = 'NARRATOR'