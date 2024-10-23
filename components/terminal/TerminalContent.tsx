'use client'

import React, { useEffect } from 'react'
import { TerminalHeader } from './TerminalHeader'
import { TerminalMessages } from './TerminalMessages'
import { TerminalInput } from './TerminalInput'
import { useTerminal } from '@/contexts/TerminalContext'

export const TerminalContent: React.FC = () => {
  const { messages, isLoading, error, stop } = useTerminal()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' && isLoading) {
        stop()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isLoading, stop])

  return (
    <div className="terminal-content">
      <TerminalHeader />
      <TerminalMessages messages={messages} isLoading={isLoading} error={error} />
      <TerminalInput />
    </div>
  )
}