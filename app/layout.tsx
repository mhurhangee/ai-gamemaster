import React from 'react'
import '@/styles/main.css'
import { TerminalProvider } from '@/components/terminal/TerminalProvider'


export const metadata = {
  title: '8-Bit AI Terminal',
  description: 'An AI-powered terminal interface with an 8-bit aesthetic',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TerminalProvider>
    <html lang="en">
      <body >
        <main className="min-h-screen bg-background">
          {children}
        </main>
      </body>
    </html>
    </TerminalProvider>
  )
}