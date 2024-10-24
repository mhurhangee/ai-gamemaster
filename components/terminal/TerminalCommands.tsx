import { Message } from 'ai/react'

export const COMMANDS = {
  help: "Show available commands",
  new: "Start a new chat (delete message history)",
  regen: "Regenerate the last AI response",
  del: "Delete the last user message and AI response",
  fullscreen: "Toggle fullscreen mode for the terminal",
  exit: "Close the terminal and return to the previous page",
  home: "Navigate to the home page",
}

export const WELCOME_MESSAGE =
  "Welcome to the AI Gamemaster! Type /help to see available commands."

interface CommandHandlers {
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  reload: () => void
  navigateBack: () => void
  navigateHome: () => void
}

export function handleCommand(command: string, handlers: CommandHandlers) {
  const { setMessages, reload, navigateBack, navigateHome } = handlers
  const lowerCommand = command.toLowerCase()

  switch (lowerCommand) {
    case "help":
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content:
            "Available commands:\n" +
            Object.entries(COMMANDS)
              .map(([cmd, desc]) => `/${cmd} - ${desc}`)
              .join("\n"),
          id: Date.now().toString(),
        },
      ])
      break
    case "new":
      setMessages([
        { role: "system", content: WELCOME_MESSAGE, id: "welcome" },
      ])
      break
    case "regen":
      reload()
      break
    case "del":
      setMessages((prev) => {
        const newMessages = [...prev]
        if (newMessages.length >= 2) {
          newMessages.splice(-2, 2)
        }
        return newMessages
      })
      break
    case "exit":
      navigateBack()
      break
    case "home":
      navigateHome()
      break
    default:
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: `Unknown command: /${command}`,
          id: Date.now().toString(),
        },
      ])
  }
}