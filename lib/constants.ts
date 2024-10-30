// constants.ts

export const MESSAGE_HISTORY_LENGTH = 5

import { openai } from '@ai-sdk/openai'
import { LanguageModelV1 } from 'ai'

export type CoreAspect = 'genre' | 'styleAndTone' | 'theme' | 'moodAndMotifs' | 'moralsAndMainObjective'
export type GameAspect = 'playerCharacterAndAttributes' | 'partyAndRelationships' | 'questsAndObjectives' | 'inventoryAndEquipment' | 'abilitiesAndMechanics' | 'factionsAndReputation'


export const CORE_ASPECTS = {
  genre: {
    SETUP_PROMPT: `Let's start with the genre of your game. What broad category (e.g., Fantasy, Sci-Fi, Mystery) and subgenre (e.g., Cyberpunk, High Fantasy) would you like for your game?`,
    UPDATE_PROMPT: `Update the genre information. Include details about the broad category and subgenre of the game.`,
  },
  styleAndTone: {
    SETUP_PROMPT: `Now, let's define the style and tone of your game. What narrative and descriptive style, along with the emotional tone, would you like for your game (e.g., dark, heroic, whimsical)?`,
    UPDATE_PROMPT: `Update the style and tone information. Include details about the narrative style and emotional tone of the game.`,
  },
  theme: {
    SETUP_PROMPT: `Let's establish the core theme of your game. What ideas would you like your game to explore (e.g., power and corruption, redemption, survival)?`,
    UPDATE_PROMPT: `Update the theme information. Include details about the core ideas and philosophical foundation of the game.`,
  },
  moodAndMotifs: {
    SETUP_PROMPT: `Now, let's define the mood and motifs of your game. What emotional atmosphere and recurring symbols or patterns would you like in your game?`,
    UPDATE_PROMPT: `Update the mood and motifs information. Include details about the emotional atmosphere and recurring symbols in the game.`,
  },
  moralsAndMainObjective: {
    SETUP_PROMPT: `Finally for the core aspects, let's establish the morals and main objective of your game. What ethical framework and primary quest or mission would you like for your game?`,
    UPDATE_PROMPT: `Update the morals and main objective information. Include details about the ethical framework and primary quest of the game.`,
  },
}

export const GAME_ASPECTS = {
  playerCharacterAndAttributes: {
    SETUP_PROMPT: `Let's focus on the player character and attributes. Describe the main character, including attributes (e.g., Strength, Intelligence), skills, class, and background traits.`,
    UPDATE_PROMPT: `Update the player character and attributes information. Include details about the main character's attributes, skills, class, and background.`,
  },
  partyAndRelationships: {
    SETUP_PROMPT: `Now, let's outline the party and relationships. Describe potential companions and allies, and how relationships might evolve throughout the game.`,
    UPDATE_PROMPT: `Update the party and relationships information. Include details about companions, allies, and evolving relationships.`,
  },
  questsAndObjectives: {
    SETUP_PROMPT: `Let's define the quests and objectives. What are the primary and secondary quests? What are the potential rewards and branching outcomes?`,
    UPDATE_PROMPT: `Update the quests and objectives information. Include details about primary and secondary quests, rewards, and potential outcomes.`,
  },
  inventoryAndEquipment: {
    SETUP_PROMPT: `Now, let's consider inventory and equipment. What kinds of items, weapons, armor, and artifacts might be found in the game?`,
    UPDATE_PROMPT: `Update the inventory and equipment information. Include details about items, weapons, armor, and special artifacts in the game.`,
  },
  abilitiesAndMechanics: {
    SETUP_PROMPT: `Let's outline the abilities and mechanics. What are the core gameplay systems, including combat mechanics and resource management?`,
    UPDATE_PROMPT: `Update the abilities and mechanics information. Include details about core gameplay systems, combat mechanics, and resource management.`,
  },
  factionsAndReputation: {
    SETUP_PROMPT: `Finally, let's consider factions and reputation. What key groups exist in the game world, and how might the player's actions affect their standing with these groups?`,
    UPDATE_PROMPT: `Update the factions and reputation information. Include details about key groups in the game world and how player actions affect reputation.`,
  },
}

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
    SYSTEM: `You are an AI guiding a player through the setup phase of a text-based RPG. Focus on gathering essential information about the RPG such as core aspects and game aspects. Make the setup phase dynamic and interesting without starting the actual adventure.`,
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
      
      ## Current aspect to setup
      """ 
      {{currentAspect}}
      """

      # INSTRUCTIONS FOR RESPONSE
      Provide a message that prompts the User to provide information for the current aspect. You may include illustrative examples and suggestions to assist the user. Remember to focus on Core Aspects first, then move on to Game Aspects.
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
      {{userMessage}}
      """

      ## Current game state
      """
      {{gameState}}
      """

      ## Is Setup Phase
      """
      {{isSetupPhase}}
      """

      # INSTRUCTIONS FOR RESPONSE
      If isSetupPhase is true, select the aspect that needs updating from both CORE_ASPECTS and GAME_ASPECTS.
      If isSetupPhase is false, select the aspect that needs updating only from GAME_ASPECTS.
      If no aspect needs updating or if moving to the next aspect is appropriate, return 'moveToNext'.
    `,
    TEMP: 0.1,
    MAX_TOKENS: 16384,
    OUTPUT: 'enum',
    ENUM: [
      ...Object.keys(CORE_ASPECTS),
      ...Object.keys(GAME_ASPECTS),
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
    SYSTEM: `You are an AI assistant that determines if the game setup is complete for a text-based RPG. Your role is crucial in transitioning from the setup phase to the main game. Respond with either 'true' or 'false'.`,
    PROMPT: `
      # CONTEXT FOR RESPONSE
      Analyze the following game state, the last AI response, and the last user message to determine if the setup is sufficiently complete to begin the main game adventure.

      ## Game state
      """
      {{gameState}}
      """

      ## Last AI response
      """
      {{lastAIResponse}}
      """
      
      ## Last user message
      """
      {{userMessage}}
      """

      ## Required aspects for a complete setup
      1. World and Lore: The game world should have a defined setting, major historical events, and unique elements.
      2. Characters and Mechanics: There should be information about the main character(s), important NPCs, and core gameplay systems.
      3. Quests and Progression: The game should have outlined main quests or objectives and a basic progression system.

      # INSTRUCTIONS FOR RESPONSE
      Evaluate if all required aspects have sufficient detail to start the main game. Consider the following:
      - Is there enough information about the world and its lore in the game state?
      - Are the main characters and core game mechanics defined in the game state?
      - Is there at least one clear quest or objective for the player to pursue in the game state?
      - Does the last AI response indicate that all necessary setup information has been gathered?
      - Does the last user message suggest that they are ready to begin the main game or that they have provided all necessary setup information?

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



export const generateWelcomeMessage = (): string => {
  let message = `Welcome to the AI-powered RPG! I'm your narrator and guide through this adventure. Before we begin, let's customize your game world. We'll explore various aspects of the game, starting with Core Aspects and then moving on to Game Aspects. Here are the aspects we'll cover:\n\n`

  message += `Core Aspects:\n`
  for (const key of Object.keys(CORE_ASPECTS)) {
    message += `- ${key.split(/(?=[A-Z])/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}\n`
  }

  message += `\nGame Aspects:\n`
  for (const key of Object.keys(GAME_ASPECTS)) {
    message += `- ${key.split(/(?=[A-Z])/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}\n`
  }

  message += `\nLet's start with the genre. ${CORE_ASPECTS.genre.SETUP_PROMPT}`

  return message
}