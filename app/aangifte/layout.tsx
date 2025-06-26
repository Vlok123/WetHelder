import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Slimme Aangifte-Assistent - WetHelder | Juridisch Correcte Politieaangiftes',
  description: 'Stel stap-voor-stap juridisch correcte politieaangiftes op met begeleiding. Voor diefstal, oplichting, vernieling, mishandeling en meer. Gratis hulp bij aangifte doen.',
  keywords: [
    'aangifte doen', 'politieaangifte', 'aangifte online', 'aangifte opstellen',
    'diefstal aangifte', 'oplichting aangifte', 'vernieling aangifte', 'mishandeling aangifte',
    'bedreiging aangifte', 'aangifte hulp', 'aangifte assistent', 'juridische aangifte',
    'politie.nl aangifte', 'slachtofferhulp', 'criminaliteit melden', 'strafbare feiten'
  ],
  openGraph: {
    title: 'Slimme Aangifte-Assistent - WetHelder',
    description: 'Stel stap-voor-stap juridisch correcte politieaangiftes op met begeleiding.',
    url: 'https://wethelder.nl/aangifte',
  },
}

export default function AngifteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 