// constants.ts

import { openai } from '@ai-sdk/openai'
import { LanguageModelV1 } from 'ai'

export type GameAspect = keyof typeof MANAGER_CONFIGS

const BASEMODEL = openai('gpt-4o-mini')

type BaseLLMConfig = {
  MODEL: LanguageModelV1;
  SYSTEM: string;
  PROMPT: string;
  TEMP: number;
  MAX_TOKENS: number;
}

type EnumLLMConfig = BaseLLMConfig & {
  OUTPUT: 'enum';
  ENUM: string[];
}

type StandardLLMConfig = BaseLLMConfig & {
  OUTPUT?: 'no-schema' | 'object';
}

type LLMConfig = EnumLLMConfig | StandardLLMConfig;

export const LLM: Record<string, LLMConfig> = {
  SETUP_NARRATOR: {
    MODEL: BASEMODEL,
    SYSTEM: `You are an AI narrator guiding a player through the setup phase of an RPG. Be adaptive and responsive to the player's input. If the player asks you to generate content or move on, do so without further prompting. Always be ready to progress the setup phase.`,
    PROMPT: `
      Current game state: {{gameState}}
      User's last message: {{userMessage}}
      Provide a narrative prompt that advances the story and setup. If the user asks to move on or generate content, do so immediately. Focus on one aspect at a time, but make it feel natural and story-driven.
    `,
    TEMP: 0.7,
    MAX_TOKENS: 16384,
  },
  MAIN_GAME_NARRATOR: {
    MODEL: BASEMODEL,
    SYSTEM: `You are an AI narrator for the main gameplay of an interactive story-based RPG. Guide the player through the game, describe scenes, characters, and events vividly. Respond to user actions, maintain consistency, and encourage active participation in shaping the story.`,
    PROMPT: `
      Game state: {{gameState}}
      Recent interaction:
      AI: {{lastAIResponse}}
      User: {{lastUserMessage}}
      Updated aspects: {{updatedAspects}}
      Provide an engaging narrative response that advances the story, incorporates the updated aspects, and prompts the user for their next action.
    `,
    TEMP: 0.7,
    MAX_TOKENS: 16384,
  },
  DETECTOR: {
    MODEL: BASEMODEL,
    SYSTEM: `You are an AI assistant that detects which aspects of a text-based RPG need updating based on the latest interaction. Be sensitive to user instructions about moving on or generating content.`,
    PROMPT: `
      Analyze the following interaction and determine which game elements require attention:
      AI response: {{lastAIResponse}}
      User message: {{lastUserMessage}}
      Current game state: {{gameState}}
      
      Select the aspects that need updating from the following list. If the user asks to move on or generate content, select the next incomplete aspect.
    `,
    TEMP: 0.1,
    MAX_TOKENS: 16384,
    OUTPUT: 'enum',
    ENUM: [
      'loreAndWorldbuilding',
      'rulesAndMechanics',
      'charactersAndParties',
      'questsAndObjectives',
      'inventoryAndResources',
      'dialogueAndInteraction',
      'environmentAndExploration',
      'combatAndEncounters',
      'progressionAndSkills',
      'economyAndTrading',
      'settingsAndOptions',
      'moveToNext'
    ]
  },
  ASPECT_UPDATER: {
    MODEL: BASEMODEL,
    SYSTEM: `You are an AI assistant that updates specific aspects of a text-based RPG based on the latest interaction. If the user asks you to generate content, do so creatively and comprehensively.`,
    PROMPT: `
      Update the {{aspect}} aspect of the game state based on the following interaction:
      AI response: {{lastAIResponse}}
      User message: {{lastUserMessage}}
      Current aspect state: {{aspectState}}
      
      If the user asks to generate content or move on, create a comprehensive update for this aspect. Otherwise, update based on the user's input.
      Provide a JSON object representing the updated state of this aspect.
    `,
    TEMP: 0.1,
    MAX_TOKENS: 16384,
  },
  SETUP_COMPLETE_CHECKER: {
    MODEL: BASEMODEL,
    SYSTEM: `You are an AI assistant that determines if the game setup is complete. Respond with either 'true' or 'false'.`,
    PROMPT: `
      Analyze the following game state and determine if it's sufficiently complete to begin the main game adventure.
      Game state: {{gameState}}
      Consider the following aspects: {{aspects}}
      
      Respond with 'true' if the setup is complete (all necessary aspects have sufficient detail), or 'false' if more information is needed.
    `,
    TEMP: 0.1,
    MAX_TOKENS: 16384,
    OUTPUT: 'enum',
    ENUM: ['true', 'false']
  },
  STORY_SEED_GENERATOR: {
    MODEL: BASEMODEL,
    SYSTEM: `You are an AI storyteller tasked with creating an engaging opening for an RPG adventure.`,
    PROMPT: `
      Based on the following game state, generate an engaging opening to the adventure that sets the scene and gives the player their initial goal or quest.
      Game state: {{gameState}}
      Provide a short, engaging narrative that kicks off the adventure.
    `,
    TEMP: 0.7,
    MAX_TOKENS: 16384,
  },
}

export const MANAGER_CONFIGS = {
  loreAndWorldbuilding: {
    PROMPT: `Update the lore and worldbuilding information. Include details about the world's history, cultures, and major events.`,
  },
  rulesAndMechanics: {
    PROMPT: `Update the rules and mechanics information. Include details about game mechanics, combat systems, and any unique rules for this world.`,
  },
  charactersAndParties: {
    PROMPT: `Update the characters and parties information. Include details about the player's character, party members, and significant NPCs.`,
  },
  questsAndObjectives: {
    PROMPT: `Update the quests and objectives information. Include current quests, long-term goals, and any changes to existing objectives.`,
  },
  inventoryAndResources: {
    PROMPT: `Update the inventory and resources information. Include items acquired or lost, currency changes, and resource management details.`,
  },
  dialogueAndInteraction: {
    PROMPT: `Update the dialogue and interaction information. Include key conversations, character relationships, and interaction options.`,
  },
  environmentAndExploration: {
    PROMPT: `Update the environment and exploration information. Include details about locations visited, discoveries made, and environmental challenges.`,
  },
  combatAndEncounters: {
    PROMPT: `Update the combat and encounters information. Include details about recent battles, enemy types, and combat outcomes.`,
  },
  progressionAndSkills: {
    PROMPT: `Update the progression and skills information. Include character levels, unlocked skills, and experience points gained.`,
  },
  economyAndTrading: {
    PROMPT: `Update the economy and trading information. Include details about transactions, market conditions, and economic factors in the game world.`,
  },
  settingsAndOptions: {
    PROMPT: `Update the settings and options information. Include any changes to game settings, difficulty levels, or player preferences.`,
  },
}

const formatAspectName = (name: string): string => {
  return name
    .split(/(?=[A-Z])/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const generateWelcomeMessage = (): string => {
  let message = `Welcome to the AI-powered RPG! I'm your narrator and guide through this adventure. Before we begin, let's customize your game world. We'll explore various aspects of the game, and you can provide your preferences or ideas. Here are the aspects we'll cover:\n\n`

  for (const key of Object.keys(MANAGER_CONFIGS)) {
    message += `- ${formatAspectName(key)}\n`
  }

  message += `\nLet's start with Lore and Worldbuilding. What kind of world would you like to explore? You can describe a genre, a specific setting, or any ideas you have for the game world.`

  return message
}