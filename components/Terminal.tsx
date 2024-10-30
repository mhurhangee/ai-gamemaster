'use client'

import React, { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { useTerminal } from './TerminalProvider'
import CRTEffect from "./CRTEffect"

// ASCII Art component
const ASCIIArt: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <pre className="ascii-art">
    <code>{children}</code>
  </pre>
)

// MarkdownRenderer component
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  return (
    <ReactMarkdown
      className="markdown-content"
      components={{
        code: ({ children }) => <ASCIIArt>{children}</ASCIIArt>
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

// LoadingAnimation component
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

// TerminalMessages component
const TerminalMessages: React.FC = () => {
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
          <span className={`message-content ${message.role}-prompt`}>
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

// TerminalInput component
const TerminalInput: React.FC = () => {
  const { input, handleInputChange, handleSubmit, isLoading } = useTerminal()
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  })

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
    }
  }, [input])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input.trim() !== '') {
        handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
      }
    }
  }

  return (
    <div className="terminal-input-container">
      <span className="input-prompt">{'>'}</span>
      <textarea
        ref={inputRef}
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="terminal-input"
        disabled={isLoading}
        rows={1}
      />
    </div>
  )
}

// Main Terminal component
export const Terminal: React.FC = () => {
  return (
    <CRTEffect>
      <div className='terminal-container'>
        <div className="terminal-content">
          <div className="terminal-body">
            <TerminalMessages />
            <TerminalInput />
          </div>
        </div>
      </div>
    </CRTEffect>
  )
}

export default Terminal