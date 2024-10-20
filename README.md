# AI Dungeon Master

An innovative, LLM-powered text-based RPG experience using Next.js, TypeScript, and the AI SDK.

## Project Overview

AI Dungeon Master is a dynamic, text-based RPG that leverages the power of Large Language Models (LLMs) to create a unique and adaptive gaming experience. Unlike traditional RPGs with fixed rules and predefined character types, this game allows for open-ended character creation, flexible party composition, and a fluid approach to game mechanics like health, experience, and equipment.

Key Features:

- LLM-controlled game logic and storytelling
- Open-ended character and party creation
- Adaptive game mechanics
- 8-bit style terminal interface
- Save/Load functionality using unique codes


## Project Structure

```plaintext
ai-dungeon-master/
├── app/
│   ├── api/
│   │   ├── game-action/
│   │   │   └── route.ts
│   │   ├── save-game/
│   │   │   └── route.ts
│   │   └── load-game/
│   │       └── route.ts
│   ├── page.tsx
│   └── layout.tsx
├── components/
│   └── Terminal.tsx
├── lib/
│   ├── game-engine.ts
│   ├── story-generator.ts
│   ├── party-manager.ts
│   ├── world-state-manager.ts
│   ├── content-moderation.ts
│   └── openai-client.ts
├── types/
│   ├── game-state.ts
│   └── party.ts
├── utils/
│   └── sequential-generation.ts
├── .env.local
├── next.config.js
├── package.json
└── tsconfig.json
```

## Key Components

### 1. Terminal Interface (`components/Terminal.tsx`)

The existing terminal component serves as the main user interface. It handles rendering of game text and user input.

### 2. Game Engine (`lib/game-engine.ts`)

The core of the game logic. It processes user actions, updates the game state, and coordinates with other components.

```typescript
// lib/game-engine.ts
import { generateStoryEvent } from './story-generator';
import { updateParty } from './party-manager';
import { updateWorldState } from './world-state-manager';
import { isContentAppropriate } from './content-moderation';

export async function processGameAction(action: string, gameState: GameState): Promise<GameState> {
  if (!(await isContentAppropriate(action))) {
    return { ...gameState, error: "Inappropriate content detected." };
  }

  const updatedParty = await updateParty(gameState.party, action);
  const updatedWorld = await updateWorldState(gameState.world, action);
  const storyEvent = await generateStoryEvent(updatedParty, updatedWorld);

  return {
    ...gameState,
    party: updatedParty,
    world: updatedWorld,
    storyEvents: [...gameState.storyEvents, storyEvent],
  };
}
```

### 3. Story Generator (`lib/story-generator.ts`)

Generates narrative content based on the current game state and player actions.

```typescript
// lib/story-generator.ts
import { openai } from './openai-client';
import { sequentialGeneration } from '../utils/sequential-generation';

export async function generateStoryEvent(party: Party, world: WorldState): Promise<string> {
  const prompt = `Given the current party state: ${JSON.stringify(party)} and world state: ${JSON.stringify(world)}, generate the next story event.`;
  
  return await sequentialGeneration(prompt, (prevContent) => {
    return openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a creative storyteller for an 8-bit style RPG.' },
        { role: 'user', content: prevContent },
      ],
    });
  });
}
```

### 4. Party Manager (`lib/party-manager.ts`)

Manages the player's party, including character creation, progression, and equipment.

```typescript
// lib/party-manager.ts
import { openai } from './openai-client';
import { Party, Character } from '../types/party';

export async function createCharacter(description: string): Promise<Character> {
  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a character creator for an 8-bit style RPG.' },
      { role: 'user', content: `Create a character based on this description: "${description}"` },
    ],
  });

  return JSON.parse(response.data.choices[0].message?.content || '{}');
}

export async function updateParty(party: Party, action: string): Promise<Party> {
  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are managing a party in an 8-bit style RPG.' },
      { role: 'user', content: `Update the party based on this action: "${action}". Current party: ${JSON.stringify(party)}` },
    ],
  });

  return JSON.parse(response.data.choices[0].message?.content || '{}');
}
```

### 5. World State Manager (`lib/world-state-manager.ts`)

Maintains and updates the game world state based on player actions and time passage.

```typescript
// lib/world-state-manager.ts
import { openai } from './openai-client';
import { WorldState } from '../types/game-state';

export async function updateWorldState(world: WorldState, action: string): Promise<WorldState> {
  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are managing the world state in an 8-bit style RPG.' },
      { role: 'user', content: `Update the world based on this action: "${action}". Current world state: ${JSON.stringify(world)}` },
    ],
  });

  return JSON.parse(response.data.choices[0].message?.content || '{}');
}
```

### 6. Content Moderation (`lib/content-moderation.ts`)

Implements safeguards to prevent inappropriate content or off-topic conversations.

```typescript
// lib/content-moderation.ts
import { openai } from './openai-client';

export async function isContentAppropriate(content: string): Promise<boolean> {
  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a content moderator for an 8-bit style RPG.' },
      { role: 'user', content: `Is this content appropriate: "${content}"? Respond with true or false.` },
    ],
  });

  return response.data.choices[0].message?.content?.toLowerCase() === 'true';
}
```

### 7. Sequential Generation Utility (`utils/sequential-generation.ts`)

Implements sequential generation to maintain coherence and prevent the LLM from going off-topic.

```typescript
// utils/sequential-generation.ts
import { ChatCompletionRequestMessage } from 'openai';

export async function sequentialGeneration(
  initialPrompt: string,
  generateFunc: (prevContent: string) => Promise<any>,
  maxIterations: number = 3
): Promise<string> {
  let content = initialPrompt;
  let result = '';

  for (let i = 0; i < maxIterations; i++) {
    const response = await generateFunc(content);
    const newContent = response.data.choices[0].message?.content || '';
    result += newContent;
    content = `${content}\n${newContent}\nContinue the story:`;
  }

  return result;
}
```

## API Routes

### 1. Game Action (`app/api/game-action/route.ts`)

Handles all game actions, updating the game state and generating responses.

```typescript
// app/api/game-action/route.ts
import { NextResponse } from 'next/server';
import { processGameAction } from '@/lib/game-engine';

export async function POST(req: Request) {
  const { action, gameState } = await req.json();
  const updatedGameState = await processGameAction(action, gameState);
  return NextResponse.json(updatedGameState);
}
```

### 2. Save Game (`app/api/save-game/route.ts`)

Handles saving the game state and generating a unique code.

### 3. Load Game (`app/api/load-game/route.ts`)

Handles loading a game state using a unique code.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local`:

```plaintext
OPENAI_API_KEY=your_api_key_here
```


4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser


## Key Concepts

1. **Open-ended Character Creation**: Players can describe their characters in natural language, and the LLM will interpret and create appropriate game statistics.
2. **Flexible Party System**: Parties can consist of any number or type of characters, with the LLM managing party dynamics and interactions.
3. **Adaptive Game Mechanics**: Instead of fixed rules for health, experience, or equipment, the LLM interprets the game state and player actions to determine outcomes.
4. **Dynamic Storytelling**: The story evolves based on player actions and the current game state, creating a unique experience for each playthrough.
5. **Content Moderation**: Safeguards are in place to ensure appropriate content and maintain the game's theme and tone.
6. **Sequential Generation**: This technique is used to maintain coherence in the narrative and prevent the LLM from going off-topic.


## Future Enhancements

1. Implement a more sophisticated save/load system with cloud storage
2. Add audio effects or background music to enhance the 8-bit aesthetic
3. Implement a combat system that leverages the LLM for dynamic, narrative-driven encounters
4. Create a visual inventory or character sheet system within the terminal interface
5. Develop a system for player choices to have long-term consequences on the game world


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.