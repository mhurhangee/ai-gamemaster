// constants.ts

import { openai } from '@ai-sdk/openai'
import { LanguageModelV1 } from 'ai'

export type GameAspect = keyof typeof GAME_ASPECTS

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
    SYSTEM: `You are an AI guiding a player through the setup phase of a text-based RPG. Focus on gathering essential information about the RPG such as game world and characters. Make the setup phase dynamic and interesting without starting the actual adventure.`,
    PROMPT: `

      # CONTEXT FOR RESPONSE
      Using the current game state, and latest interaction between the user and the AI, progress the setup of the text-based RPG.

      ## Current game state
      """
      {{gameState}}
      """
      
      ## Last Message from Setup Narrator
      """
      {{lastAIResponse}}
      """

      ## Latest message from User
      """
      {{userMessage}}
      """
      
      ## Current game aspect to setup
      """ 
      {{currentAspect}}
      """

      # INSTRUCTIONS FOR RESPONSE
      Provide a message that prompts the User to provide information for the current game aspect.  You may include illustrative examples and suggestions to assist the user.
    `,
    TEMP: 0.7,
    MAX_TOKENS: 16384,
  },
  MAIN_GAME_NARRATOR: {
    MODEL: BASEMODEL,
    SYSTEM: `You are an AI narrator for the main gameplay of an interactive text-based RPG. Guide the player through the game, describe scenes, characters, and events vividly. Respond to user actions, maintain consistency, and encourage active participation in shaping the story.  Structure your response in a following format.
    
    ## TITLE (could be quest name, location or something else relevant)
    Brief summary of the action or story point that has lead the the current situation.
    ---
    *Detailed description of scene in italics*
    ---
    (Optional) Include very brief summary of relevant parts of the "GAMESTATE"
    ---
    Guidance for what to do next
    - Bullet point of 2-4 suggested options.
    `,
    PROMPT: `
      # CONTEXT FOR RESPONSE
      Using the GAMESTATE and the latest messages between the user and AI, resolve the latest interaction in the text-based RPG in a meaningful way.  
      
      ## GAMESTATE
      """
      {{gameState}}
      """
      
      ## AI
      """
      {{lastAIResponse}}
      """

      ## User
      """
      {{lastUserMessage}}
      """

      # INSTRUCTIONS FOR RESPONSE
      Provide an engaging narrative response that advances the story and prompts the user for their next action in the provided format.
    `,
    TEMP: 0.7,
    MAX_TOKENS: 16384,
  },
  DETECTOR: {
    MODEL: BASEMODEL,
    SYSTEM: `You are an AI assistant that detects which aspects of a text-based RPG need updating based on the latest interaction.`,
    PROMPT: `
      # CONTEXT FOR RESPONSE
      Analyze the following interaction between the AI and USER and determine which game aspects in the game state require updating.

      ## AI response 
      """
      {{lastAIResponse}}
      """

      ## User message 
      """
      {{lastUserMessage}}
      """

      ## Current game state
      """
      {{gameState}}
      """

      # INSTRUCTIONS FOR RESPONSE
      Select the aspects that need updating from the following list.
    `,
    TEMP: 0.1,
    MAX_TOKENS: 16384,
    OUTPUT: 'enum',
    ENUM: [
      'worldAndLore',
      'charactersAndMechanics',
      'questsAndProgression',
      'moveToNext'
    ]
  },
  ASPECT_UPDATER: {
    MODEL: BASEMODEL,
    SYSTEM: `You are an AI assistant that updates specific aspects of a text-based RPG's GAMESTATE based on the latest interaction between the AI and the User.`,
    PROMPT: `
      # CONTEXT FOR RESPONSE
      Update the {{aspect}} ASPECT of the GAMESTATE based on the following interaction:

      ## AI response
      """
      {{lastAIResponse}}
      """
      
      ## User message
      """
      {{lastUserMessage}}
      """

      ## Current {{aspect}} ASPECT of the GAMESTATE
      """
      {{aspectState}}
      """
      
      # INSTRUCTIONS FOR RESPONSE
      Provide a JSON object representing the updated state of this aspect. Update, amend or add to the current aspect state as relevant. Only include information relevant to this aspect.
    `,
    TEMP: 0.1,
    MAX_TOKENS: 16384,
  },
  SETUP_COMPLETE_CHECKER: {
    MODEL: BASEMODEL,
    SYSTEM: `You are an AI assistant that determines if the game setup is complete. Respond with either 'true' or 'false'.`,
    PROMPT: `
      # CONTEXT FOR RESPONSE
      Analyze the following game state, and the AI and User's messages and determine if it's sufficiently complete to begin the main game adventure.

      ## Game state
      """
      {{gameState}}
      """

      ## AI response
      """
      {{lastAIResponse}}
      """
      
      ## User message
      """
      {{lastUserMessage}}
      """

      ## Consider the following aspects
      """
      {{aspects}}
      """

      # INSTRUCTIONS FOR RESPONSE
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
      # CONTEXT FOR RESPONSE
      Based on the following game state, generate an engaging opening to the adventure that sets the scene and gives the player their initial goal or quest.
      ## Game state
      """
      {{gameState}}
      """

      # INSTRUCTIONS FOR RESPONSE
       Provide a short, engaging narrative that kicks off the adventure.
    `,
    TEMP: 0.7,
    MAX_TOKENS: 16384,
  },
  GAMEMASTER: {
    MODEL: BASEMODEL,
    SYSTEM: `You are an AI gamemaster assistant. Your role is to help the player manage and modify the game state without affecting the narrative flow.`,
    PROMPT: `
      # CONTEXT FOR RESPONSE
      ## Current game state
      """
      {{gameState}}
      """
      ## User's request
      """
      {{userMessage}}
      """

      # INSTRUCTIONS FOR RESPONSE
      Interpret the user's request and suggest appropriate changes to the game state. Provide your response as a JSON object representing the updated game state.
    `,
    TEMP: 0.1,
    MAX_TOKENS: 16384,
  },
}

export const GAME_ASPECTS = {
  worldAndLore: {
    SETUP_PROMPT: `Let's establish the world and lore of your game. Describe the setting, major historical events, cultures, and any unique elements of this world.`,
    UPDATE_PROMPT: `Update the world and lore information. Include details about the world's history, cultures, and major events.`,
  },
  charactersAndMechanics: {
    SETUP_PROMPT: `Now, let's focus on characters and game mechanics. Describe the main character(s), important NPCs, and the core gameplay systems (e.g., magic, combat, skills).`,
    UPDATE_PROMPT: `Update the characters and mechanics information. Include details about player characters, NPCs, and game systems.`,
  },
  questsAndProgression: {
    SETUP_PROMPT: `Finally, let's outline the main quests and progression system. What are the primary objectives? How do characters grow and develop over time?`,
    UPDATE_PROMPT: `Update the quests and progression information. Include current quests, long-term goals, and character advancement details.`,
  },
}

export const generateWelcomeMessage = (): string => {
  let message = `Welcome to the AI-powered RPG! I'm your narrator and guide through this adventure. Before we begin, let's customize your game world. We'll explore various aspects of the game, and you can provide your preferences or ideas. Here are the aspects we'll cover:\n\n`

  for (const [key, value] of Object.entries(GAME_ASPECTS)) {
    message += `- ${key.split(/(?=[A-Z])/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}\n`
  }

  message += `\nLet's start with World and Lore. ${GAME_ASPECTS.worldAndLore.SETUP_PROMPT}`

  return message
}