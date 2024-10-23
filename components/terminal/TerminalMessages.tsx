"use client"

import React from 'react'

interface Message {
  role: 'user' | 'assistant' | 'system' | 'function' | 'tool' | 'data'
  content: string
  id: string
}

interface TerminalMessagesProps {
  messages: Message[]
  isLoading: boolean
  error: Error | null
}

const LoadingAnimation = () => {
  const frames = ["|", "/", "-", "\\"]
  const [frame, setFrame] = React.useState(0)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setFrame((prevFrame) => (prevFrame + 1) % frames.length)
    }, 250)
    return () => clearInterval(timer)
  }, [])

  return <span className="loading-animation">{frames[frame]}</span>
}

export const TerminalMessages: React.FC<TerminalMessagesProps> = ({ messages, isLoading, error }) => {
  return (
    <div className="terminal-scroll-area">
      {messages.map((message) => (
        <div key={message.id} className="message">
          <span className={`message-role ${message.role}-message`}>
            {message.role === 'user' ? '> ' : message.role === 'assistant' ? '$ ' : '! '}
          </span>
          <span className={`message-content ${message.role}-message`}>{message.content}</span>
        </div>
      ))}
      {isLoading && (
          <span className="message-content"> <LoadingAnimation />
          </span>
      )}
      {error && (
        <div className="message">
          <span className="message-role system-message">! </span>
          <span className="message-content error-message">{error.message}</span>
        </div>
      )}
    </div>
  )
}