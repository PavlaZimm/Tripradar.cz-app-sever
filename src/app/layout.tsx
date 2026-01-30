import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'TripRadar - Výlety jinak',
  description: 'Personalizované výletové zážitky. Vyber si, co tě zajímá, a my ti připravíme trasu plnou překvapení.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TripRadar',
  },
  openGraph: {
    title: 'TripRadar - Výlety jinak',
    description: 'Personalizované výletové zážitky plné překvapení',
    url: 'https://tripradar.cz',
    siteName: 'TripRadar',
    locale: 'cs_CZ',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF8F5' },
    { media: '(prefers-color-scheme: dark)', color: '#1A2418' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <head>
        <link rel="icon" href="/icons/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
