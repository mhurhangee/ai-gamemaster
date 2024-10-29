'use client'

import React from 'react'
import { TerminalMessages } from './TerminalMessages'
import { TerminalInput } from './TerminalInput'
import { TerminalProvider } from './TerminalProvider'
import CRTEffect from "./CRTEffect"

export const Terminal: React.FC = () => {
  return (
    <TerminalProvider>
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
    </TerminalProvider>
  )
}