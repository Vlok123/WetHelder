import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'WetHelder - Nederlandse Wetgeving Doorzoeken',
    template: '%s | WetHelder'
  },
  description: 'Professionele juridische zoektool voor Nederlandse wetgeving, feitcodes en boetebedragen. Speciaal ontwikkeld voor juristen, politie, handhavers en rechtsprofessionals.',
  keywords: ['Nederlandse wetgeving', 'juridische zoektool', 'feitcodes', 'boetebedragen', 'RVV 1990', 'WVW 1994', 'strafrecht', 'verkeersrecht', 'handhaving'],
  authors: [{ name: 'WetHelder' }],
  creator: 'WetHelder',
  publisher: 'WetHelder',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://wethelder.nl'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://wethelder.nl',
    title: 'WetHelder - Nederlandse Wetgeving Doorzoeken',
    description: 'Professionele juridische zoektool voor Nederlandse wetgeving, feitcodes en boetebedragen.',
    siteName: 'WetHelder',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WetHelder - Nederlandse Wetgeving Doorzoeken',
    description: 'Professionele juridische zoektool voor Nederlandse wetgeving, feitcodes en boetebedragen.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification codes when available
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${inter.className} font-sans antialiased`}>
        <Providers>
          <div className="min-h-screen bg-background text-foreground">
            <main className="relative">
              {children}
            </main>
          </div>
        </Providers>
        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "WetHelder",
              "description": "Professionele juridische zoektool voor Nederlandse wetgeving, feitcodes en boetebedragen",
              "url": "https://wethelder.nl",
              "applicationCategory": "LegalApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "EUR"
              },
              "provider": {
                "@type": "Organization",
                "name": "WetHelder"
              }
            }),
          }}
        />
        
        <Analytics />
      </body>
    </html>
  )
} 