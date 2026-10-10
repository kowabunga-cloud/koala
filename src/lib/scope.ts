import { useSyncExternalStore } from 'react'

// Current project / region / zone selection, shared by the header switchers and every page.
export type Scope = { project?: string; region?: string; zone?: string }

const STORAGE_KEY = 'kowabunga.scope'
const listeners = new Set<() => void>()

let current: Scope = load()

function load(): Scope {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Scope
  } catch {
    return {}
  }
}

export function setScope(patch: Scope) {
  current = { ...current, ...patch }
  // a zone only makes sense inside its region
  if ('region' in patch && patch.region !== undefined) {
    if (!('zone' in patch)) current.zone = undefined
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useScope(): Scope {
  return useSyncExternalStore(subscribe, () => current)
}
