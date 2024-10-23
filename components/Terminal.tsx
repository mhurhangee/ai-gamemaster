'use client'

import React from 'react'
import { TerminalProvider } from '@/contexts/TerminalContext'
import { TerminalContainer } from './terminal/TerminalContainer'
import { TerminalContent } from './terminal/TerminalContent'
import CRTEffect from './CRTEffect'

export const Terminal: React.FC = () => {
  return (
    <TerminalProvider>
      <CRTEffect>
        <TerminalContainer>
          <TerminalContent />
        </TerminalContainer>
      </CRTEffect>
    </TerminalProvider>
  )
}