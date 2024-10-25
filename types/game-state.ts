// types/game-state.ts

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