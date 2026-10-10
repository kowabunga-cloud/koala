import { jwtDecode } from 'jwt-decode'

const STORAGE_KEY = 'kowabunga.jwt'

export type Role = 'user' | 'projectAdmin' | 'superAdmin'

type Claims = { exp?: number; role?: Role; uid?: string }

type Listener = () => void
const listeners = new Set<Listener>()

function read(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function claims(token: string | null): Claims | null {
  if (!token) return null
  try {
    return jwtDecode<Claims>(token)
  } catch {
    return null
  }
}

// Minimal JWT session store, readable from React (useSyncExternalStore) and plain code (API client, router guards).
export const auth = {
  getToken(): string | null {
    const token = read()
    const c = claims(token)
    if (!c || (c.exp && c.exp * 1000 < Date.now())) return null
    return token
  },
  isAuthenticated(): boolean {
    return auth.getToken() !== null
  },
  role(): Role {
    return claims(auth.getToken())?.role ?? 'user'
  },
  login(token: string) {
    try {
      localStorage.setItem(STORAGE_KEY, token)
    } catch {
      /* private mode: session lasts until reload */
    }
    listeners.forEach((l) => l())
  },
  logout() {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    listeners.forEach((l) => l())
  },
  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}
