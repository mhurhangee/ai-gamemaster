'use client'

import React, { useEffect } from 'react'
import { TerminalMessages } from './TerminalMessages'
import { TerminalInput } from './TerminalInput'
import { useTerminal } from '@/contexts/TerminalContext'
import CRTEffect from "@/components/terminal/CRTEffect"

export const TerminalContainer: React.FC = () => {
  const { messages, isLoading, error, stop, processAction } = useTerminal()

  useEffect(() => {
    if (messages.length === 0) {
      processAction('/start')
    }
  }, [messages, processAction])

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
      <CRTEffect>
    <div className='terminal-container'>
    <div className="terminal-content">
    <div className="terminal-header">
      <h2 className="terminal-title">AI Gamemaster</h2>
    </div>
      <TerminalMessages messages={messages} isLoading={isLoading} error={error} />
      <TerminalInput />
    </div>
    </div>
    </CRTEffect>

  )
}