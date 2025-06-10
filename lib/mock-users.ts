// Mock user storage for development
// Replace this with actual database when implemented

export interface MockUser {
  id: string
  email: string
  password: string
  name: string | null
  role: 'admin' | 'user'
  createdAt: string
}

export const defaultUsers: MockUser[] = [
  {
    id: '1',
    email: 'test@wethelder.nl',
    password: 'test',
    name: 'Test User',
    role: 'user',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    email: 'sanderhelmink@gmail.com',
    password: 'admin123',
    name: 'Sander Helmink',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    email: 'demo@wethelder.nl',
    password: 'demo',
    name: 'Demo User',
    role: 'user',
    createdAt: new Date().toISOString()
  }
]

// Additional registered users (in-memory storage)
export let registeredUsers: MockUser[] = []

// Reset tokens storage (in-memory)
interface ResetToken {
  email: string
  token: string
  expires: Date
}

let resetTokens: ResetToken[] = []

export function addUser(user: MockUser) {
  registeredUsers.push(user)
}

export function findUser(email: string): MockUser | undefined {
  return [...defaultUsers, ...registeredUsers].find(u => u.email === email)
}

export function userExists(email: string): boolean {
  return findUser(email) !== undefined
}

export function generateResetToken(email: string): string {
  // Generate a simple token (in production use crypto.randomBytes)
  const token = Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  
  // Remove any existing tokens for this email
  resetTokens = resetTokens.filter(rt => rt.email !== email)
  
  // Add new token (expires in 1 hour)
  const expires = new Date()
  expires.setHours(expires.getHours() + 1)
  
  resetTokens.push({
    email,
    token,
    expires
  })
  
  return token
}

export function validateResetToken(token: string, email: string): boolean {
  const resetToken = resetTokens.find(rt => 
    rt.token === token && 
    rt.email === email && 
    rt.expires > new Date()
  )
  
  return !!resetToken
}

export function useResetToken(token: string, email: string): boolean {
  const tokenIndex = resetTokens.findIndex(rt => 
    rt.token === token && 
    rt.email === email && 
    rt.expires > new Date()
  )
  
  if (tokenIndex !== -1) {
    // Remove the token so it can only be used once
    resetTokens.splice(tokenIndex, 1)
    return true
  }
  
  return false
}

export function updateUserPassword(email: string, newPassword: string): boolean {
  // Find user in default users
  const defaultUserIndex = defaultUsers.findIndex(u => u.email === email)
  if (defaultUserIndex !== -1) {
    defaultUsers[defaultUserIndex].password = newPassword
    return true
  }
  
  // Find user in registered users
  const registeredUserIndex = registeredUsers.findIndex(u => u.email === email)
  if (registeredUserIndex !== -1) {
    registeredUsers[registeredUserIndex].password = newPassword
    return true
  }
  
  return false
} 