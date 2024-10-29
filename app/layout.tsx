import React from 'react'
import '@/styles/main.css'
import { TerminalProvider } from '@/components/TerminalProvider'


export const metadata = {
  title: 'AI RPG GameMaster',
  description: 'An AI-powered RPG GameMaster with a terminal aesthetic',
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