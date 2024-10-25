import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

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
  EXTRACTOR: {
    MODEL: BASEMODEL,
    SYSTEM: `You are an AI assistant that extracts relevant information from user messages and AI responses in a text-based RPG. 
    Focus on changes in the party, story progression, and inventory updates.
    
    Extract relevant information from the following AI response and user message:
    
    AI response: {aiResponse}
    
    User message: {userMessage}`,
    TEMP: 0.2,
    MAX_TOKENS: 512,
  },
}


export const EXTRACTION_SCHEMA = z.object({
  party: z.object({
    changes: z.array(z.string().describe('Any changes to existing party members, e.g. level ups, new abilities')),
    newMembers: z.array(z.string().describe('Names of new characters joining the party')),
    removedMembers: z.array(z.string().describe('Names of characters leaving the party')),
  }).describe('Information about the party composition and changes'),
  story: z.object({
    progressions: z.array(z.string().describe('Any advancements in the main plot or side quests')),
    newLocations: z.array(z.string().describe('Names of new areas or locations discovered')),
    completedObjectives: z.array(z.string().describe('List of completed quests or objectives')),
  }).describe('Information about story progression and world exploration'),
  inventory: z.object({
    addedItems: z.array(z.string().describe('New items acquired by the party')),
    removedItems: z.array(z.string().describe('Items removed from the party inventory')),
    usedItems: z.array(z.string().describe('Items used or consumed by the party')),
  }).describe('Information about inventory changes'),
}).describe('Extracted information from the game interaction')

export const DEFAULT_ENGINE = 'NARRATOR'