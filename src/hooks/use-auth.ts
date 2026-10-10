import { useSyncExternalStore } from 'react'
import { auth } from '@/lib/auth'

export function useAuth() {
  const token = useSyncExternalStore(auth.subscribe, auth.getToken)
  return { token, isAuthenticated: token !== null, role: auth.role() }
}
