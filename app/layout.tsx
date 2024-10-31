import React from 'react'
import '@/styles/main.css'
import { TerminalProvider } from '@/components/TerminalProvider'

export const metadata = {
  title: 'AI RPG GameMaster',
  description: 'An AI-powered RPG GameMaster with a terminal aesthetic',
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎮</text></svg>',
        type: 'image/svg+xml',
      },
    ],
  },
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