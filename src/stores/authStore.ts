import { create } from 'zustand'
import { StaffUser } from '@/types'
import { getCurrentUser, login as authLogin, logout as authLogout, initializeDefaultUsers } from '@/lib/auth'

interface AuthStore {
  user: StaffUser | null
  initialized: boolean
  initialize: () => void
  login: (username: string, password: string) => StaffUser | null
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  initialized: false,
  initialize: () => {
    initializeDefaultUsers()
    const user = getCurrentUser()
    set({ user, initialized: true })
  },
  login: (username, password) => {
    const user = authLogin(username, password)
    if (user) set({ user })
    return user
  },
  logout: () => {
    authLogout()
    set({ user: null })
  },
}))
