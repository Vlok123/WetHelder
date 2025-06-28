import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wethelder.nl'
  
  // Static routes
  const staticRoutes = [
    '',
    '/ask',
    '/wetuitleg', 
    '/jurisprudentie',
    '/aangifte',
    '/politie-wet',
    '/contact',
    '/auth/signin',
    '/auth/signup',
  ]

  // Politie-wet categories
  const politieWetCategories = [
    'bevoegdheden',
    'id-fouilleren', 
    'verkeer',
    'opsporing',
    'privacy',
    'klacht'
  ]

  // Sample articles for sitemap
  const politieWetArticles = [
    'id-controle-politie',
    'id-fouillering-op-straat',
    'verkeerscontrole-bevoegdheden',
    'id-plicht-nederland',
    'blaastest-rechten',
    'politie-aanhouding-rechten',
    'politie-klacht-indienen'
  ]

  const currentDate = new Date()

  return [
    // Static routes
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: currentDate,
      changeFrequency: route === '' ? 'daily' as const : 'weekly' as const,
      priority: route === '' ? 1 : 0.8,
    })),
    
    // Politie-wet category pages
    ...politieWetCategories.map((category) => ({
      url: `${baseUrl}/politie-wet/${category}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),

    // Politie-wet article pages
    ...politieWetArticles.map((article) => ({
      url: `${baseUrl}/politie-wet/artikel/${article}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
} 