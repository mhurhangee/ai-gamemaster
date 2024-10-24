import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { processGameAction } from '@/lib/game-engine'
import { generateStoryEvent } from '@/lib/story-generator'
import { updateParty } from '@/lib/party-manager'
import { updateWorldState } from '@/lib/world-state-manager'
import { isContentAppropriate } from '@/lib/content-moderation'
import { extractLore, updateGameLore } from '@/lib/game-lore-keeper'
import { GameState } from '@/types/game-state'
import { saveGame, loadGame } from '@/lib/save-load-manager'
import logger from '@/lib/logger'
import { STARTING_MESSAGE } from '@/lib/constants'

export async function POST(req: NextRequest) {
  try {
    logger.info('Received POST request to game route')
    const { messages, gameState } = await req.json()
    logger.info(`Received ${messages.length} messages and game state`, { messages, gameState })

    if (messages.length === 0) {
      logger.info('First message, returning welcome message')
      return NextResponse.json({
        aiResponse: STARTING_MESSAGE,
        gameState: {
          party: [],
          world: {
            locations: {},
            time: 'dawn',
            weather: 'clear',
            events: [],
          },
          currentLocation: 'start',
          inventory: [],
          questLog: [],
          gameLore: {},
        },
        storyEvent: null,
        saveCode: '',
      })
    }

    const lastMessage = messages[messages.length - 1].content
    logger.info(`Processing last message: ${lastMessage}`)

    if (!(await isContentAppropriate(lastMessage))) {
      logger.warn(`Inappropriate content detected: ${lastMessage}`)
      return NextResponse.json({ error: 'Inappropriate content detected' }, { status: 400 })
    }

    let systemMessage = 'You are an AI RPG GameMaster. Respond to the player\'s actions and advance the story based on the current game state.'
    let updatedGameState: GameState = gameState || {
      party: [],
      world: {
        locations: {},
        time: 'dawn',
        weather: 'clear',
        events: [],
      },
      currentLocation: 'start',
      inventory: [],
      questLog: [],
      gameLore: {},
    }

    if (lastMessage === '/start') {
      logger.info('Start command detected')
      systemMessage = 'You are an AI RPG GameMaster. Welcome the player and guide them through starting a new game or loading an existing one. Ask if they want to start a new game or load a saved game.'
    } else if (lastMessage.startsWith('/load ')) {
      logger.info('Load command detected')
      const saveCode = lastMessage.split(' ')[1]
      updatedGameState = await loadGame(saveCode) || updatedGameState
      logger.info(`Loaded game state with save code: ${saveCode}`)
      systemMessage = 'You are an AI RPG GameMaster. The player has loaded a saved game. Provide a brief recap of their current situation and ask what they want to do next.'
    } else if (updatedGameState.currentLocation === 'start') {
      if (lastMessage.toLowerCase().includes('new game')) {
        logger.info('New game request detected')
        systemMessage = 'You are an AI RPG GameMaster. Guide the player through creating their character. Ask about their character\'s name, appearance, and background.'
      } else if (lastMessage.toLowerCase().includes('load game')) {
        logger.info('Load game request detected')
        systemMessage = 'You are an AI RPG GameMaster. Ask the player to provide their save code to load a game.'
      }
    }

    const prompt = `
Current Game State:
${JSON.stringify(updatedGameState, null, 2)}

User Action:
${lastMessage}

Based on the current game state and user action, generate an appropriate response and advance the story.
`

    logger.info('Sending request to OpenAI', {
      model: 'gpt-4o-mini',
      system: systemMessage,
      messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
      prompt
    })

    const aiResponse = await streamText({
      model: openai('gpt-4o-mini'),
      system: "You are a joke bot",
      prompt: "Tell me a joke about space",
      maxTokens: 256,
    })

    const responseText = await aiResponse.text
    logger.info('Received response from OpenAI', { responseText })

    // Extract and update lore
    logger.info('Extracting and updating lore')
    const extractedLore = await extractLore(responseText)
    const updatedLore = await updateGameLore(updatedGameState.gameLore, extractedLore)

    // Process game action and update game state
    logger.info('Processing game action and updating game state')
    updatedGameState = await processGameAction(updatedGameState, lastMessage, responseText)

    // Generate next story event
    logger.info('Generating next story event')
    const storyEvent = await generateStoryEvent(updatedGameState, lastMessage)

    // Update party
    logger.info('Updating party')
    const updatedParty = await updateParty(updatedGameState.party, updatedGameState, storyEvent.narrative)

    // Update world state
    logger.info('Updating world state')
    const updatedWorldState = await updateWorldState(updatedGameState.world, updatedGameState, [lastMessage])

    // Combine all updates
    const finalGameState: GameState = {
      ...updatedGameState,
      party: updatedParty,
      world: updatedWorldState,
      gameLore: updatedLore,
    }

    logger.info('Saving game state')
    const saveCode = await saveGame(finalGameState)

    logger.info('Returning response')
    return NextResponse.json({
      aiResponse: responseText,
      gameState: finalGameState,
      storyEvent,
      saveCode,
    })
  } catch (error) {
    logger.error('Error in game route:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}