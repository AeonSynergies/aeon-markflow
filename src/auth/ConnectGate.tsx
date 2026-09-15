import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from './AuthContext'

/**
 * MarkFlow's backend doesn't have a /login route yet (see AuthContext) — this is a stand-in so
 * the app is usable against a real backend today: paste the shared JWT and an org id, both
 * things a human already has from Mongo/an issued token during local dev.
 */
export function ConnectGate({ children }: { children: React.ReactNode }) {
  const { session, setSession } = useAuth()
  const [token, setToken] = React.useState('')
  const [orgId, setOrgId] = React.useState('')

  if (session) return <>{children}</>

  return (
    <div className="flex h-screen items-center justify-center">
      <form
        className="flex w-80 flex-col gap-4 rounded-lg border p-6"
        onSubmit={(event) => {
          event.preventDefault()
          if (token.trim() && orgId.trim()) {
            setSession({ token: token.trim(), orgId: orgId.trim() })
          }
        }}
      >
        <div>
          <h1 className="text-lg font-semibold">Connect to MarkFlow</h1>
          <p className="text-muted-foreground text-sm">
            Paste an auth token and org id to continue.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="token">Auth token</Label>
          <Input
            id="token"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Bearer token"
            autoComplete="off"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="org-id">Organization id</Label>
          <Input
            id="org-id"
            value={orgId}
            onChange={(event) => setOrgId(event.target.value)}
            placeholder="Organization id"
            autoComplete="off"
          />
        </div>
        <Button type="submit" disabled={!token.trim() || !orgId.trim()}>
          Continue
        </Button>
      </form>
    </div>
  )
}
