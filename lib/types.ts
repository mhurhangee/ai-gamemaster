import { GameAspect } from './constants'

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  id: string
}

export interface TerminalContextType {
  messages: Message[]
  input: string
  isLoading: boolean
  error: Error | null
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isSetupPhase: boolean
}



export interface SetupPhase {
  completed: boolean;
  currentAspect: GameAspect | null;
  aspectsCompleted: GameAspect[];
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

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  id: string;
}