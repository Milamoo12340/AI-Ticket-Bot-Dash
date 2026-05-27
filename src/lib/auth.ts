import { StaffUser, StaffRole } from '@/types'
import { generateId } from '@/lib/utils'

const USERS_KEY = 'ph_staff_users'
const SESSION_KEY = 'ph_session'

export function initializeDefaultUsers(): void {
  const existing = localStorage.getItem(USERS_KEY)
  if (existing) return
  const defaults: StaffUser[] = [
    {
      id: generateId(),
      username: 'PsychoAdmin',
      email: 'admin@psychohatcher.com',
      password: 'admin1234',
      role: 'admin',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      active: true,
    },
    {
      id: generateId(),
      username: 'ModSupport',
      email: 'mod@psychohatcher.com',
      password: 'mod1234',
      role: 'moderator',
      createdAt: new Date().toISOString(),
      active: true,
    },
    {
      id: generateId(),
      username: 'ViewerStaff',
      email: 'viewer@psychohatcher.com',
      password: 'viewer1234',
      role: 'viewer',
      createdAt: new Date().toISOString(),
      active: true,
    },
  ]
  localStorage.setItem(USERS_KEY, JSON.stringify(defaults))
}

export function getUsers(): StaffUser[] {
  const data = localStorage.getItem(USERS_KEY)
  return data ? JSON.parse(data) : []
}

export function saveUsers(users: StaffUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function login(username: string, password: string): StaffUser | null {
  const users = getUsers()
  const user = users.find(
    (u) => (u.username === username || u.email === username) && u.password === password && u.active
  )
  if (user) {
    user.lastLogin = new Date().toISOString()
    saveUsers(users)
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return user
  }
  return null
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function getCurrentUser(): StaffUser | null {
  const data = localStorage.getItem(SESSION_KEY)
  return data ? JSON.parse(data) : null
}

export function canAccess(user: StaffUser | null, requiredRole: StaffRole): boolean {
  if (!user) return false
  const hierarchy: Record<StaffRole, number> = { admin: 3, moderator: 2, viewer: 1 }
  return hierarchy[user.role] >= hierarchy[requiredRole]
}
