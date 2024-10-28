// types/game-state.ts
/*
export interface Character {
  name: string;
  description: string;
  stats: Record<string, number>;
  skills: string[];
  inventory: string[];
}

export interface Location {
  name: string;
  description: string;
  characters: string[];
  items: string[];
}

export interface WorldState {
  locations: Record<string, Location>;
  time: string;
  weather: string;
  events: string[];
}

export interface QuestLog {
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed';
}

export interface GameLore {
  rules: string[];
  worldFacts: string[];
  characters: string[];
}

export interface GameState {
  party: Character[];
  world: WorldState;
  currentLocation: string;
  inventory: Array<{
    name: string;
    description: string;
    quantity: number;
  }>;
  questLog: QuestLog[];
  gameLore: GameLore;
}

export type Party = Character[];
*/

import { GameAspect } from '@/lib/constants'

interface SetupPhase {
  completed: boolean;
  currentAspect: GameAspect | null;
}

export interface GameState {
  loreAndWorldbuilding: Record<string, any>;
  rulesAndMechanics: Record<string, any>;
  charactersAndParties: Record<string, any>;
  questsAndObjectives: Record<string, any>;
  inventoryAndResources: Record<string, any>;
  dialogueAndInteraction: Record<string, any>;
  environmentAndExploration: Record<string, any>;
  combatAndEncounters: Record<string, any>;
  progressionAndSkills: Record<string, any>;
  economyAndTrading: Record<string, any>;
  settingsAndOptions: Record<string, any>;
  setupPhase: SetupPhase;
}