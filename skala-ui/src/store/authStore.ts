import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  refreshToken: string | null
  username: string | null
  setTokens: (token: string, refreshToken: string, username: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      username: null,
      setTokens: (token, refreshToken, username) =>
        set({ token, refreshToken, username }),
      logout: () => set({ token: null, refreshToken: null, username: null }),
    }),
    { name: 'skala-auth' }
  )
)
