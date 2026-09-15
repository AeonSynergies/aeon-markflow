import createClient, { type Middleware } from 'openapi-fetch'
import type { paths } from './schema/markflow-backend'

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'

export const api = createClient<paths>({ baseUrl })

let currentToken: string | null = null

/** Called by AuthProvider whenever the session's token changes. */
export function setAuthToken(token: string | null): void {
  currentToken = token
}

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    if (currentToken) {
      request.headers.set('Authorization', `Bearer ${currentToken}`)
    }
    return request
  },
}

api.use(authMiddleware)
