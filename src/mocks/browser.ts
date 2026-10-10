import { faker } from '@faker-js/faker'
import { http, HttpResponse, type RequestHandler } from 'msw'
import { setupWorker } from 'msw/browser'
import { getLoginMockHandler } from '@/api/generated/endpoints/user/user.msw'
import { getReadSubnetMockHandler } from '@/api/generated/endpoints/subnet/subnet.msw'

// Mock mode (`npm run dev:mock`): every endpoint answers with fake data generated from the spec,
// so the UI can be developed without a running Kahuna.

// hand-written overrides come first and take precedence over the generated ones
const overrides: RequestHandler[] = [
  // any email/password logs in as a super admin
  getLoginMockHandler(async ({ request }) => {
    const { email } = (await request.json()) as { email: string }
    return { email, password: '', jwt: fakeJwt({ email, role: 'superAdmin', uid: 'mock' }) }
  }),
  http.post('/api/v1/logout', () => new HttpResponse(null, { status: 204 })),
  getReadSubnetMockHandler(() => {
    const net = `10.${faker.number.int(255)}.${faker.number.int(255)}`
    return { id: faker.string.uuid(), name: faker.word.noun(), cidr: `${net}.0/24`, gateway: `${net}.1`, dns: `${net}.1` }
  }),
]

// collects get<Tag>Mock() from every generated *.msw.ts file
const generated = Object.values(
  import.meta.glob<Record<string, () => RequestHandler[]>>('../api/generated/endpoints/*/*.msw.ts', { eager: true }),
).flatMap((mod) =>
  Object.entries(mod)
    .filter(([name]) => /^get[A-Z]\w*Mock$/.test(name) && !name.endsWith('ResponseMock'))
    .flatMap(([, factory]) => factory()),
)

export const worker = setupWorker(...overrides, ...generated)

function fakeJwt(claims: Record<string, unknown>): string {
  const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ ...claims, exp: Math.floor(Date.now() / 1000) + 86400 })}.mock`
}
