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

export function addUser(user: MockUser) {
  registeredUsers.push(user)
}

export function findUser(email: string): MockUser | undefined {
  return [...defaultUsers, ...registeredUsers].find(u => u.email === email)
}

export function userExists(email: string): boolean {
  return findUser(email) !== undefined
} 