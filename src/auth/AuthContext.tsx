import * as React from 'react'

import { setAuthToken } from '@/api/client'

/**
 * MarkFlow and Onboard share one JWT (same signing secret, see CLAUDE.md) but MarkFlow's
 * backend doesn't expose a /login route yet — Phase 4 assumes a token is already in hand
 * (dev tooling, or Onboard's login once the services are wired together). Until then this
 * context just persists whatever token + org the user was handed, so the workflow builder has
 * something to send as `Authorization: Bearer <token>` and to scope /orgs/:orgId calls to.
 */
export interface AuthSession {
  token: string
  orgId: string
}

interface AuthContextValue {
  session: AuthSession | null
  setSession: (session: AuthSession | null) => void
}

const STORAGE_KEY = 'markflow.session'

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

function readStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<AuthSession>
    if (typeof parsed.token !== 'string' || typeof parsed.orgId !== 'string') return null
    return { token: parsed.token, orgId: parsed.orgId }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = React.useState<AuthSession | null>(() => readStoredSession())

  const setSession = React.useCallback((next: AuthSession | null) => {
    setSessionState(next)
    try {
      if (next) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // localStorage can be unavailable (private browsing, blocked site data) — session still
      // works for the rest of this page load, it just won't survive a refresh.
    }
  }, [])

  React.useEffect(() => {
    setAuthToken(session?.token ?? null)
  }, [session])

  const value = React.useMemo(() => ({ session, setSession }), [session, setSession])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
