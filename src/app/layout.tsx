import type { Metadata, Viewport } from 'next'
import React from 'react'
import '../styles/index.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'Marasim',
  description: 'Manage events and send invitations with ease',
  metadataBase: new URL('https://marasim.digital/'),
  icons: {
    icon: [{ url: '/logo2.png', type: 'image/png' }],
    shortcut: [{ url: '/logo2.png', type: 'image/png' }],
    apple: [{ url: '/logo2.png', type: 'image/png' }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
