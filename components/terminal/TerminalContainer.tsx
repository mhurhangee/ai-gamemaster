"use client"

import React from 'react'
import { useTerminal } from '@/contexts/TerminalContext'

interface TerminalContainerProps {
  children: React.ReactNode
}

export const TerminalContainer: React.FC<TerminalContainerProps> = ({ children }) => {
  const { isFullscreen } = useTerminal()

  return (
    <div className={`terminal-container ${isFullscreen ? 'fullscreen' : ''}`}>
      {children}
    </div>
  )
}