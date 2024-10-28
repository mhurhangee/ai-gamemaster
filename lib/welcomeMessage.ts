import { MANAGER_CONFIGS } from './constants'

const formatAspectName = (name: string): string => {
  return name
    .split(/(?=[A-Z])/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const generateWelcomeMessage = (): string => {
  let message = `Welcome to the AI-powered RPG! I'm your narrator and guide through this adventure. Before we begin, let's customize your game world. We'll go through each aspect of the game, and you can provide your preferences or ideas. Here are the aspects we'll cover:\n\n`

  for (const key of Object.keys(MANAGER_CONFIGS)) {
    message += `- ${formatAspectName(key)}\n`
  }

  message += `\nLet's start with Lore and Worldbuilding. What kind of world would you like to explore? You can describe a genre, a specific setting, or any ideas you have for the game world.`

  return message
}