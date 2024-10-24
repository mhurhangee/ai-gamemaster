'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useTerminal } from '@/contexts/TerminalContext'

export const TerminalInput: React.FC = () => {
  const { input, handleInputChange, handleSubmit, isLoading } = useTerminal()
  const [caretPosition, setCaretPosition] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const caretRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    updateCaretPosition()
    focusInput()
  }, [input])

  useEffect(() => {
    focusInput()
    window.addEventListener('click', focusInput)
    return () => {
      window.removeEventListener('click', focusInput)
    }
  }, [])

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const updateCaretPosition = () => {
    if (inputRef.current && caretRef.current) {
      const selectionStart = inputRef.current.selectionStart || 0
      const textBeforeCaret = input.slice(0, selectionStart)
      const textWidth = getTextWidth(textBeforeCaret, getComputedStyle(inputRef.current))
      setCaretPosition(textWidth)
    }
  }

  const getTextWidth = (text: string, font: CSSStyleDeclaration) => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (context) {
      context.font = font.font
      return context.measureText(text).width
    }
    return 0
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input.trim() !== '') {
        handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
      }
    }
    updateCaretPosition()
  }

  const handleClick = () => {
    updateCaretPosition()
  }

  return (
    <div className="terminal-input-container" onClick={focusInput}>
      <span className="input-prompt">{'>'}</span>
      <div className="terminal-input-wrapper">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onClick={handleClick}
          className="terminal-input"
          ref={inputRef}
          autoFocus
          disabled={isLoading}
        />
        <div
          ref={caretRef}
          className="terminal-caret"
          style={{ left: `${caretPosition}px` }}
        />
      </div>
    </div>
  )
}