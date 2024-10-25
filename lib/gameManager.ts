import { CoreMessage } from 'ai'
import { partyManager } from './managers/partyManager'
import { storyManager } from './managers/storyManager'
import { inventoryManager } from './managers/inventoryManager'
import { extractionManager } from './managers/extractionManager'
import logger from './logger'

interface GameState {
  party: any
  story: any
  inventory: any
}

export async function gameManager(messages: CoreMessage[], previousGameState: GameState): Promise<{ gameState: GameState; narratorInstructions: string }> {
  logger.debug('gameManager.ts - messages:', messages)
  logger.debug('gameManager.ts - previousGameState:', previousGameState)

  const lastUserMessage = messages[messages.length - 1].content
  const lastAIResponse = messages.length > 1 ? messages[messages.length - 2].content : ''

  const extractedInfo = await extractionManager(
    typeof lastUserMessage === 'string' ? lastUserMessage : JSON.stringify(lastUserMessage),
    typeof lastAIResponse === 'string' ? lastAIResponse : JSON.stringify(lastAIResponse)
  )

  const updatedParty = await partyManager(extractedInfo.party, previousGameState.party)
  const updatedStory = await storyManager(extractedInfo.story, previousGameState.story)
  const updatedInventory = await inventoryManager(extractedInfo.inventory, previousGameState.inventory)

  const gameState: GameState = {
    party: updatedParty,
    story: updatedStory,
    inventory: updatedInventory
  }

  const narratorInstructions = generateNarratorInstructions(gameState, previousGameState)

  logger.debug('gameManager.ts - updatedGameState:', gameState)
  logger.debug('gameManager.ts - narratorInstructions:', narratorInstructions)

  return { gameState, narratorInstructions }
}

function generateNarratorInstructions(gameState: GameState, previousGameState: GameState): string {
  let instructions = ''

  if (!previousGameState || previousGameState.story.isNewGame) {
    instructions += 'This is a new game. Assist the user in world build, decicing on a story and creating a party. '
  }

  instructions += `Current party: ${JSON.stringify(gameState.party)}. `
  instructions += `Current story progress: ${JSON.stringify(gameState.story)}. `
  instructions += `Current inventory: ${JSON.stringify(gameState.inventory)}. `

  return instructions
}