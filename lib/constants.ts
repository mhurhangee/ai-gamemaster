import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

const BASEMODEL = openai('gpt-4o-mini')

export const LLM = {
  NARRATOR: {
    MODEL: BASEMODEL,
    SYSTEM: `You are an AI narrator for an interactive story-based RPG. Your role is to guide the player through the game, describe scenes, characters, and events in a vivid and engaging manner. Follow these key instructions:

1. Setup Phase:
   - Guide the player through setting up each aspect of the game world.
   - Be patient and thorough, ensuring each aspect is fully explored before moving to the next.
   - Provide options and suggestions based on what has been established so far.
   - Only move to the next aspect or complete the setup when explicitly instructed.

2. Main Game:
   - Respond to user actions and choices by advancing the story in interesting ways.
   - Incorporate updates to game aspects into your narrative, explaining how they affect the game world or player's options.
   - Maintain consistency with previously established elements of the game world and characters.

3. General Guidelines:
   - Always adhere strictly to the current game state and narrator instructions provided.
   - Be creative while maintaining a consistent tone throughout the narrative.
   - Balance providing information with asking for user input to keep the interaction engaging and collaborative.
   - If user input contradicts existing information, find creative ways to reconcile the differences or explain the changes in-world.
   - Provide clear options or prompts for the player when appropriate, encouraging their active participation in shaping the story.

Remember, your primary goal is to create an immersive and interactive experience that responds dynamically to the player's choices and the evolving game state.`,
    TEMP: 0.7,
    MAX_TOKENS: 16384,
  },
  // ... (rest of the LLM object remains the same)
  DETECTOR: {
    MODEL: BASEMODEL,
    SYSTEM: `You are an AI assistant that detects which aspects of a text-based RPG need updating based on the latest interaction. 
    Analyze the AI response and user message to determine which game elements require attention.`,
    TEMP: 0.2,
    MAX_TOKENS: 16384,
  },
}

export const MANAGER_CONFIGS = {
  loreAndWorldbuilding: {
    PROMPT: `Update the lore and world-building elements based on the recent interaction. Include worldHistory (string), cultures (array of strings), and factions (array of strings).`,
  },
  rulesAndMechanics: {
    PROMPT: `Update the rules and mechanics based on the recent interaction. Include coreMechanics (array of strings), combatRules (string), and skillSystem (string).`,
  },
  charactersAndParties: {
    PROMPT: `Update the characters and party information based on the recent interaction. Include partyMembers (array of objects with name, role, and attributes) and npcs (array of objects with name and role).`,
  },
  questsAndObjectives: {
    PROMPT: `Update the quests and objectives based on the recent interaction. Include activeQuests (array of objects with name, description, and status) and completedQuests (array of strings).`,
  },
  inventoryAndResources: {
    PROMPT: `Update the inventory and resources based on the recent interaction. Include items (array of objects with name, quantity, and type) and currency (number).`,
  },
  dialogueAndInteraction: {
    PROMPT: `Update the dialogue and interaction information based on the recent interaction. Include recentDialogues (array of objects with speaker and content) and importantChoices (array of strings).`,
  },
  environmentAndExploration: {
    PROMPT: `Update the environment and exploration information based on the recent interaction. Include currentLocation (string), discoveredLocations (array of strings), and mapFeatures (array of strings).`,
  },
  combatAndEncounters: {
    PROMPT: `Update the combat and encounters information based on the recent interaction. Include recentCombats (array of objects with enemies and outcome) and combatStats (object with totalVictories and totalDefeats).`,
  },
  progressionAndSkills: {
    PROMPT: `Update the progression and skills information based on the recent interaction. Include characterLevels (object with character names as keys and levels as values), unlockedSkills (array of strings), and experiencePoints (object with character names as keys and XP as values).`,
  },
  economyAndTrading: {
    PROMPT: `Update the economy and trading information based on the recent interaction. Include playerWealth (number) and recentTransactions (array of objects with item, quantity, price, and type).`,
  },
  settingsAndOptions: {
    PROMPT: `Update the settings and options based on the recent interaction. Include difficulty (string: 'easy', 'normal', or 'hard'), audioSettings (object with musicVolume and sfxVolume), and displaySettings (object with brightness and contrast).`,
  },
}

export const DETECTOR_SCHEMA = z.object({
  loreAndWorldbuilding: z.boolean(),
  rulesAndMechanics: z.boolean(),
  charactersAndParties: z.boolean(),
  questsAndObjectives: z.boolean(),
  inventoryAndResources: z.boolean(),
  dialogueAndInteraction: z.boolean(),
  environmentAndExploration: z.boolean(),
  combatAndEncounters: z.boolean(),
  progressionAndSkills: z.boolean(),
  economyAndTrading: z.boolean(),
  settingsAndOptions: z.boolean(),
}).describe('Detected game aspects that need updating')

export const DEFAULT_ENGINE = 'NARRATOR'

export type GameAspect = keyof typeof MANAGER_CONFIGS