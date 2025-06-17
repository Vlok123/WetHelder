import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const envInfo = {
    NODE_ENV: process.env.NODE_ENV,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ? 'SET (' + process.env.GOOGLE_API_KEY.substring(0, 20) + '...)' : 'MISSING',
    GOOGLE_CSE_ID: process.env.GOOGLE_CSE_ID ? 'SET (' + process.env.GOOGLE_CSE_ID + ')' : 'MISSING',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET (' + process.env.OPENAI_API_KEY.substring(0, 20) + '...)' : 'MISSING',
    DATABASE_URL: process.env.DATABASE_URL ? 'SET (hidden)' : 'MISSING',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'MISSING',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET (hidden)' : 'MISSING',
    // Check if we can read .env files
    PWD: process.cwd(),
    ENV_FILES_CHECK: 'Checking .env file loading...'
  }

  return NextResponse.json(envInfo, { status: 200 })
} 