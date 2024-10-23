'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { EBButton } from "./EBButton"
import { EBDropdown, EBDropdownTrigger, EBDropdownContent, EBDropdownItem, EBDropdownSeparator } from "./EBDropdown"

interface EffectState {
  pixel: boolean
  scanline: boolean
  vignette: boolean
  textShadow: boolean
  textFlicker: boolean
  phosphor: boolean
}

interface CRTEffectProps {
  children: React.ReactNode
}

export default function CRTEffect({ children }: CRTEffectProps) {
  const [effects, setEffects] = useState<EffectState>({
    pixel: false,
    scanline: false,
    vignette: false,
    textShadow: false,
    textFlicker: false,
    phosphor: false,
  })

  const toggleEffect = (effect: keyof EffectState) => {
    setEffects(prev => ({ ...prev, [effect]: !prev[effect] }))
  }

  const toggleAll = () => {
    const allOn = Object.values(effects).every(v => v)
    setEffects(prev => Object.fromEntries(
      Object.entries(prev).map(([key]) => [key, !allOn])
    ) as unknown as EffectState)
  }

  useEffect(() => {
    document.body.classList.toggle('crt-text-shadow', effects.textShadow)
    document.body.classList.toggle('crt-text-flicker', effects.textFlicker)
    document.body.classList.toggle('crt-phosphor', effects.phosphor)
  }, [effects.textShadow, effects.textFlicker, effects.phosphor])

  return (
    <>
      <div className="crt-effects">
        {Object.entries(effects).map(([key, value]) => 
          !['textShadow', 'textFlicker', 'phosphor', 'pageTransition'].includes(key) && 
          <div key={key} className={`crt-${key} ${value ? 'active' : ''}`} />
        )}
      </div>
      <div className="eb-dropdown-wrapper">
        <EBDropdown>
          <EBDropdownTrigger asChild>
            <EBButton variant="eightBit" size="sm" className="eb-dropdown-button eight-bit-text">
              FX
            </EBButton>
          </EBDropdownTrigger>
          <EBDropdownContent>
            <EBDropdownItem onClick={toggleAll}>
              All: {Object.values(effects).every(v => v) ? 'On' : 'Off'}
            </EBDropdownItem>
            <EBDropdownSeparator />
            {Object.entries(effects).map(([key, value]) => (
              <EBDropdownItem key={key} onClick={() => toggleEffect(key as keyof EffectState)}>
                {key.charAt(0).toUpperCase() + key.slice(1)}: {value ? 'On' : 'Off'}
              </EBDropdownItem>
            ))}
          </EBDropdownContent>
        </EBDropdown>
      </div>
        <div className="transition-opacity duration-300 opacity-100 crt-content">
          {children}
        </div>
    </>
  )
}