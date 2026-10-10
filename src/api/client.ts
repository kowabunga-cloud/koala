import { auth } from '@/lib/auth'

const API_BASE = '/api/v1'

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, body: unknown) {
    super(typeof body === 'object' && body && 'message' in body ? String(body.message) : `HTTP ${status}`)
    this.status = status
    this.body = body
  }
}

// Single entry point for every generated API call: base URL, auth header, error handling.
export async function kowabungaFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  const token = auth.getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers })

  const text = await res.text()
  const body = text ? safeJson(text) : undefined

  if (!res.ok) {
    if (res.status === 401) auth.logout()
    throw new ApiError(res.status, body)
  }
  return body as T
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

// Picked up by Orval: every generated hook reports errors as ApiError.
export type ErrorType<_E> = ApiError
export type BodyType<B> = B
