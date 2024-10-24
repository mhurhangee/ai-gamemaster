# AI Dungeon Master

An innovative, LLM-powered text-based RPG experience using Next.js, TypeScript, and the AI SDK.

## Project Overview

AI Dungeon Master is a dynamic, text-based RPG that leverages the power of Large Language Models (LLMs) to create a unique and adaptive gaming experience. It allows for open-ended character creation, flexible party composition, and a fluid approach to game mechanics, all while providing a structured way to start, save, and load games. The game maintains internal consistency through a Game Lore Keeper system.

Key Features:
- LLM-controlled game logic and storytelling
- Open-ended character and party creation
- Adaptive game mechanics (health, XP, equipment, etc.)
- Game Lore Keeper for maintaining consistent rules and world logic
- 8-bit style terminal interface
- Save/Load functionality using unique codes
- Out-of-character communication with the game master

## Project Structure

```

ai-dungeon-master/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts
│   │   ├── save-game/
│   │   │   └── route.ts
│   │   └── load-game/
│   │       └── route.ts
│   ├── page.tsx
│   └── layout.tsx
├── components/
│   ├── terminal/
│   │   ├── TerminalContainer.tsx
│   │   ├── TerminalContent.tsx
│   │   ├── TerminalHeader.tsx
│   │   ├── TerminalInput.tsx
│   │   ├── TerminalMessages.tsx
│   │   └── TerminalCommands.tsx
│   └── GameInitializer.tsx
├── contexts/
│   └── TerminalContext.tsx
├── lib/
│   ├── game-engine.ts
│   ├── game-initializer.ts
│   ├── story-generator.ts
│   ├── party-manager.ts
│   ├── world-state-manager.ts
│   ├── game-lore-keeper.ts
│   ├── save-load-manager.ts
│   └── content-moderation.ts
├── types/
│   ├── game-state.ts
│   ├── party.ts
│   └── game-lore.ts
├── utils/
│   ├── sequential-generation.ts
│   └── unique-code-generator.ts

```plaintext

## Key Components

1. Terminal Interface (`components/terminal/`)
   - Provides the main user interface for the game
   - Utilizes existing components: TerminalContainer, TerminalContent, TerminalHeader, TerminalInput, TerminalMessages

2. GameInitializer (`components/GameInitializer.tsx`)
   - Handles the process of starting a new game or loading an existing one
   - Prompts the user for initial world, party, and story details
   - Allows setting of initial game rules and lore

3. TerminalContext (`contexts/TerminalContext.tsx`)
   - Manages game state and user interactions using React's Context API
   - Integrates with the `useChat` hook for handling AI responses

4. API Routes
   - `app/api/chat/route.ts`: Handles all in-game actions and AI responses
   - `app/api/save-game/route.ts`: Manages game state saving
   - `app/api/load-game/route.ts`: Handles game state loading

5. Game Engine (`lib/game-engine.ts`)
   - Processes user actions and updates game state
   - Coordinates with other components like story generator, party manager, and Game Lore Keeper
   - Handles out-of-character communication with the game master

6. Game Initializer (`lib/game-initializer.ts`)
   - Coordinates the process of starting a new game or loading an existing one
   - Primes the story, party, and world generation processes
   - Initializes the Game Lore Keeper with user-defined rules

7. Story Generator (`lib/story-generator.ts`)
   - Generates narrative content based on the current game state and player actions
   - Utilizes sequential generation to maintain coherence
   - Consults the Game Lore Keeper to ensure consistency with established rules

8. Party Manager (`lib/party-manager.ts`)
   - Manages the player's party, including character creation and development
   - Interprets LLM responses to update character stats and inventories
   - Adheres to rules established in the Game Lore Keeper

9. World State Manager (`lib/world-state-manager.ts`)
   - Maintains and updates the game world state based on player actions and time passage
   - Ensures consistency with the Game Lore Keeper

10. Game Lore Keeper (`lib/game-lore-keeper.ts`)
    - Maintains a repository of game rules, mechanics, and world logic
    - Allows for the addition and modification of rules during gameplay
    - Provides a reference for other components to ensure consistency
    - Saves and loads rule sets along with game states

11. Save/Load Manager (`lib/save-load-manager.ts`)
    - Handles saving and loading game states, including Game Lore Keeper rules
    - Manages unique code generation and Redis interactions

12. Content Moderation (`lib/content-moderation.ts`)
    - Implements safeguards to prevent inappropriate content or off-topic conversations

## How It Works

1. Game Initialization:
   - Players start by either creating a new game or loading an existing one through the GameInitializer component.
   - For new games, the LLM prompts the user for initial world, party, and story details, as well as any specific game rules.
   - The Game Lore Keeper is initialized with these rules.
   - For loaded games, the save state and rule set are retrieved from Redis and a recap is generated.

2. User Interaction:
   - Players interact with the game through the terminal interface.
   - All inputs are processed through the `useChat` hook in TerminalContext.

3. Action Processing:
   - User actions are sent to the API route (`/api/chat/route.ts`).
   - The API route processes the action, updating the game state and generating a response using the LLM.
   - The Game Lore Keeper is consulted to ensure actions and outcomes align with established rules.
   - Out-of-character communications are handled separately by the game engine.

4. LLM Integration:
   - The LLM interprets user actions, manages game state, and generates narrative responses.
   - Sequential generation is used to maintain coherence and prevent off-topic responses.
   - The LLM references the Game Lore Keeper to maintain consistency with established rules and world logic.

5. State Management:
   - Game state is managed through the TerminalContext, which is updated based on LLM responses.
   - The Game Lore Keeper's rule set is part of the game state and is updated as needed.

6. Rule Evolution:
   - As the game progresses, new rules may be established or existing ones modified.
   - These changes are recorded in the Game Lore Keeper and applied to future interactions.

7. Saving and Loading:
   - Games can be saved at any point, generating a unique code for the user.
   - Saved games, including the current rule set from the Game Lore Keeper, are stored in Redis with an expiration date.
   - Games can be loaded using the unique code, retrieving the state and rule set from Redis.
   - Local storage is used for frequent client-side saves, syncing with Redis periodically.

8. Rendering:
   - The terminal components render the updated game state and AI responses to the user.

## Key Concepts

1. LLM-Controlled Gameplay:
   - The LLM interprets and manages all aspects of the game, including character creation, stats, and narrative progression.
   - This allows for a highly flexible and adaptive gaming experience.

2. Open-ended Character and Party System:
   - Players can describe their characters in natural language.
   - Parties can consist of any number or type of characters.

3. Adaptive Game Mechanics:
   - Instead of fixed rules for health, experience, or equipment, the LLM interprets the game state and player actions to determine outcomes.
   - The Game Lore Keeper ensures consistency in how these mechanics are applied.

4. Dynamic Storytelling:
   - The story evolves based on player actions and the current game state, creating a unique experience for each playthrough.
   - The Game Lore Keeper helps maintain internal consistency in the narrative and world logic.

5. Safeguards and Coherence:
   - Content moderation and sequential generation techniques are used to maintain appropriate content and narrative coherence.
   - The Game Lore Keeper acts as an additional safeguard against inconsistencies.

6. Persistent Gameplay:
   - Save/Load functionality allows players to continue their adventures across multiple sessions.
   - Unique codes provide a simple way to manage saves without requiring user accounts.
   - The Game Lore Keeper's rule set is saved and loaded along with the game state.

7. Out-of-Character Communication:
   - Players can communicate with the game master out of character to address issues or ask for clarifications.
   - This can include discussions about game rules, which may lead to updates in the Game Lore Keeper.

8. Rule Evolution:
   - The game's rule set can evolve organically as the story progresses.
   - Players and the LLM can establish new rules or modify existing ones, all tracked by the Game Lore Keeper.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local`:
```

OPENAI_API_KEY=your_api_key_here
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

```plaintext
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.