# AI-Powered Text-Based RPG

An immersive text-based RPG powered by AI that creates dynamic, personalized adventures through an interactive terminal interface.

## Usage

1. Start a new game session
2. Complete the setup phase by defining core and game aspects
3. Begin your adventure in the main game phase
4. Use `@` commands for gamemaster functions

## Features

- 🎮 Dynamic story generation using advanced AI models
- 💻 Retro terminal interface with CRT effects
- 🎭 Customizable game aspects including genre, style, theme, and more
- 🔄 Persistent game state management
- ⚔️ Rich character and party system
- 🌍 Complex faction and reputation mechanics

## Technical Stack

- **Frontend**: Next.js with React
- **AI Integration**: AI SDK with OpenAI models
- **State Management**: React Context
- **UI Components**: Custom terminal emulator with CRT effects
- **Styling**: Tailwind CSS

## Project Structure

```plaintext
app/
  └── api/
    └── game-engine/
      └── route.ts      # Game engine API endpoint
components/
  ├── Terminal.tsx         # Terminal UI component
  ├── TerminalProvider.tsx # Game state management
  └── CRTEffect.tsx        # Retro display effects
lib/
  ├── aiWrappers.ts        # AI integration utilities
  ├── constants.ts         # Game configuration
  └── types.ts             # TypeScript definitions
```
## Game Aspects

### Core Aspects
- Genre
- Style and Tone
- Theme
- Mood and Motifs
- Morals and Main Objective

### Game Aspects
- Player Character and Attributes
- Party and Relationships
- Quests and Objectives
- Inventory and Equipment
- Abilities and Mechanics
- Factions and Reputation

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
```

3. Set up your environment variables:

```plaintext
OPENAI_API_KEY=your_api_key_here
```


4. Start the development server:

```shellscript
npm run dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.