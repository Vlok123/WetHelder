import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import { Analytics } from '@vercel/analytics/next'
import CookieBanner from '@/components/cookie-banner'
import { Navigation } from '@/components/navigation'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'WetHelder - Nederlandse Wetgeving & Juridische Vragen | Professionele Rechtshulp',
    template: '%s | WetHelder'
  },
  description: 'Doorzoek Nederlandse wetgeving, stel juridische vragen en krijg professionele uitleg. Voor burgers, juristen, politie en studenten. Direct toegang tot 15.000+ wetsartikelen, rechtspraak en jurisprudentie.',
  keywords: [
    'Nederlandse wetgeving', 'juridische vragen', 'wetsartikelen', 'rechtspraak', 'jurisprudentie',
    'wetboek van strafrecht', 'wegenverkeerswet', 'burgerlijk wetboek', 'algemene wet bestuursrecht',
    'juridisch advies', 'rechtshulp', 'advocaat', 'jurist', 'politie', 'handhaving', 'BOA',
    'wetgeving zoeken', 'Nederlandse wet', 'strafrecht', 'verkeersrecht', 'bestuursrecht',
    'arbeidsrecht', 'huurrecht', 'familierecht', 'ondernemingsrecht', 'belastingrecht',
    'aangifte doen', 'politieaangifte', 'aangifte assistent', 'criminaliteit melden', 'slachtofferhulp'
  ],
  authors: [{ name: 'WetHelder', url: 'https://wethelder.nl' }],
  creator: 'WetHelder',
  publisher: 'WetHelder',
  category: 'Legal Services',
  classification: 'Legal Technology',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://wethelder.nl'),
  alternates: {
    canonical: '/',
    languages: {
      'nl-NL': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://wethelder.nl',
    title: 'WetHelder - Nederlandse Wetgeving & Juridische Vragen',
    description: 'Doorzoek Nederlandse wetgeving, stel juridische vragen en krijg professionele uitleg. Voor burgers, juristen, politie en studenten.',
    siteName: 'WetHelder',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'WetHelder - Nederlandse Wetgeving Platform',
        type: 'image/svg+xml',
      },
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'WetHelder - Nederlandse Wetgeving Platform',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WetHelder - Nederlandse Wetgeving & Juridische Vragen',
    description: 'Doorzoek Nederlandse wetgeving, stel juridische vragen en krijg professionele uitleg.',
    images: ['/og-image.svg', '/og-image.png'],
    creator: '@wethelder',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification codes when available
    google: '',
    yandex: '',
    yahoo: '',
  },
  other: {
    'msapplication-TileColor': '#3B82F6',
    'msapplication-config': '/browserconfig.xml',
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
        {/* Favicons - Multiple formats for maximum compatibility */}
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme colors */}
        <meta name="theme-color" content="#3B82F6" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-square70x70logo" content="/mstile-70x70.png" />
        <meta name="msapplication-square150x150logo" content="/mstile-150x150.png" />
        <meta name="msapplication-wide310x150logo" content="/mstile-310x150.png" />
        <meta name="msapplication-square310x310logo" content="/mstile-310x310.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="application-name" content="WetHelder" />
        <meta name="apple-mobile-web-app-title" content="WetHelder" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Language and Regional SEO */}
        <meta name="language" content="nl-NL" />
        <meta name="geo.region" content="NL" />
        <meta name="geo.country" content="Netherlands" />
        <meta name="ICBM" content="52.370216, 4.895168" />
        
        {/* Content Classification */}
        <meta name="rating" content="general" />
        <meta name="referrer" content="origin-when-cross-origin" />
        <meta name="color-scheme" content="light dark" />
        
        {/* Additional SEO */}
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
        <meta name="googlebot" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
        
        {/* Social Media Meta Tags */}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@wethelder" />
        
        {/* Performance Hints */}
        <link rel="preload" href="/icon.svg" as="image" type="image/svg+xml" />
        <link rel="prefetch" href="/og-image.svg" as="image" type="image/svg+xml" />
        
        {/* Preconnect for Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* DNS Prefetch for External Resources */}
        <link rel="dns-prefetch" href="//rechtspraak.nl" />
        <link rel="dns-prefetch" href="//wetten.overheid.nl" />
        
        {/* Structured Data for Local Business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              "name": "WetHelder",
              "description": "Nederlandse Wetgeving & Juridische Vragen Platform",
              "url": "https://wethelder.nl",
              "sameAs": [],
              "serviceType": "Legal Information Service",
              "areaServed": {
                "@type": "Country",
                "name": "Netherlands"
              },
              "availableLanguage": ["nl-NL"],
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Juridische Services",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Juridische Vragen Beantwoorden",
                      "description": "Professionele beantwoording van juridische vragen"
                    }
                  },
                  {
                    "@type": "Offer", 
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Wetgeving Doorzoeken",
                      "description": "Doorzoeken van Nederlandse wetgeving en rechtspraak"
                    }
                  },
                  {
                    "@type": "Offer", 
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Aangifte-Assistent",
                      "description": "Stap-voor-stap hulp bij het opstellen van juridisch correcte politieaangiftes"
                    }
                  }
                ]
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} font-sans antialiased`}>
        <Providers>
          <div className="min-h-screen bg-background text-foreground">
            <Navigation />
            <main className="relative">
              {children}
            </main>
            <CookieBanner />
          </div>
        </Providers>
        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://wethelder.nl/#website",
                  "url": "https://wethelder.nl",
                  "name": "WetHelder",
                  "description": "Nederlandse Wetgeving & Juridische Vragen Platform",
                  "potentialAction": [
                    {
                      "@type": "SearchAction",
                      "target": {
                        "@type": "EntryPoint",
                        "urlTemplate": "https://wethelder.nl/ask?q={search_term_string}"
                      },
                      "query-input": "required name=search_term_string"
                    }
                  ],
                  "inLanguage": "nl-NL"
                },
                {
                  "@type": "WebApplication",
                  "@id": "https://wethelder.nl/#webapp",
                  "name": "WetHelder",
                  "description": "Doorzoek Nederlandse wetgeving, stel juridische vragen en krijg professionele uitleg",
                  "url": "https://wethelder.nl",
                  "applicationCategory": "LegalApplication",
                  "operatingSystem": "Any",
                  "browserRequirements": "Requires JavaScript",
                  "permissions": "No special permissions required",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "EUR",
                    "availability": "https://schema.org/InStock"
                  },
                  "provider": {
                    "@type": "Organization",
                    "@id": "https://wethelder.nl/#organization"
                  },
                  "featureList": [
                    "Nederlandse wetgeving doorzoeken",
                    "Juridische vragen stellen",
                    "Rechtspraak en jurisprudentie",
                    "Professionele uitleg",
                    "Multi-doelgroep ondersteuning",
                    "Aangifte-assistent met stap-voor-stap begeleiding",
                    "Juridisch correcte politieaangiftes opstellen"
                  ]
                },
                {
                  "@type": "Organization",
                  "@id": "https://wethelder.nl/#organization",
                  "name": "WetHelder",
                  "url": "https://wethelder.nl",
                  "description": "Platform voor Nederlandse wetgeving en juridische vragen",
                  "knowsAbout": [
                    "Nederlandse wetgeving",
                    "Juridisch advies",
                    "Rechtspraak",
                    "Wetboek van Strafrecht",
                    "Wegenverkeerswet",
                    "Burgerlijk Wetboek",
                    "Algemene wet bestuursrecht"
                  ],
                  "areaServed": "Netherlands",
                  "serviceType": "Legal Information Service"
                }
              ]
            }),
          }}
        />
        
        <Analytics />
      </body>
    </html>
  )
} 