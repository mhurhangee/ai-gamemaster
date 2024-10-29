'use client'

import React, { useEffect, useRef } from 'react'
import { useTerminal } from './TerminalProvider'
import { MarkdownRenderer } from './MarkdownRender'

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

export const TerminalMessages: React.FC = () => {
  const { messages, isLoading, error } = useTerminal()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="terminal-messages custom-scrollbar">
      {messages.map((message) => (
        <div key={message.id} className={`message ${message.role}-message`}>
          <span className={`message-prompt ${message.role}-prompt`}>
            {message.role === 'user' ? '> ' : message.role === 'assistant' ? '$ ' : '! '}
          </span>
          <span className="message-content">
            {message.role === 'assistant' ? (
              <MarkdownRenderer content={message.content} />
            ) : (
              message.content
            )}
          </span>
        </div>
      ))}
      {isLoading && (
        <div className="message">
          <LoadingAnimation />
        </div>
      )}
      {error && <div className="message error-message">{error.message}</div>}
      <div ref={messagesEndRef} />
    </div>
  )
}