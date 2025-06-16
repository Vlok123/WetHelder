import { NextResponse } from 'next/server'

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  return NextResponse.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Set (length: ' + process.env.GOOGLE_CLIENT_ID.length + ')' : 'Not set',
    googleClientIdValue: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...' : 'Not set',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set (length: ' + process.env.GOOGLE_CLIENT_SECRET.length + ')' : 'Not set',
    googleClientSecretValue: process.env.GOOGLE_CLIENT_SECRET ? process.env.GOOGLE_CLIENT_SECRET.substring(0, 15) + '...' : 'Not set',
    nextAuthUrl: process.env.NEXTAUTH_URL || 'Not set',
    nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'Set (length: ' + process.env.NEXTAUTH_SECRET.length + ')' : 'Not set',
    nodeEnv: process.env.NODE_ENV,
    expectedGoogleClientId: '1048447585708-iilp5e4gar087mq2uc9u4h9brntr5vgn.apps.googleusercontent.com',
    expectedGoogleSecret: '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',
    googleClientIdMatches: process.env.GOOGLE_CLIENT_ID === '1048447585708-iilp5e4gar087mq2uc9u4h9brntr5vgn.apps.googleusercontent.com',
    googleSecretMatches: process.env.GOOGLE_CLIENT_SECRET === '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'
  })
} 