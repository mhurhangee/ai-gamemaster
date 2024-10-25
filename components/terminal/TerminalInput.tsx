'use client'

import React, { useEffect, useRef } from 'react'
import { useTerminal } from '@/components/terminal/TerminalProvider'

export const TerminalInput: React.FC = () => {
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