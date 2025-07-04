import { Info } from 'lucide-react'

interface BetaDisclaimerProps {
  variant?: 'chat' | 'wetuitleg'
  className?: string
}

export function BetaDisclaimer({ variant = 'chat', className = '' }: BetaDisclaimerProps) {
  const isChat = variant === 'chat'
  
  return (
    <div className={`flex items-start gap-2 text-xs text-gray-500 bg-amber-50/30 px-3 py-2 rounded-lg border border-amber-100 ${className}`}>
      <Info className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
      <div className="leading-relaxed">
        <span className="font-medium text-amber-700">
          {isChat ? 'WetHelder Chat' : 'WetUitleg'} is momenteel in bètafase.
        </span>
        <span className="text-gray-600 ml-1">
          Het systeem scoort goed op algemene Nederlandse wetgeving, maar specifieke regelgeving en lokale verordeningen zijn nog in ontwikkeling.
        </span>
      </div>
    </div>
  )
} 