import { defineConfig } from 'orval'

// Generates the Kowabunga API client from the pinned OpenAPI spec.
// Run `npm run api:update` to fetch a new spec version and regenerate.
export default defineConfig({
  kowabunga: {
    input: { target: './openapi/openapi.yaml' },
    output: {
      mode: 'tags-split',
      target: './src/api/generated/endpoints',
      schemas: './src/api/generated/model',
      client: 'react-query',
      httpClient: 'fetch',
      clean: true,
      mock: true,
      override: {
        mutator: { path: './src/api/client.ts', name: 'kowabungaFetch' },
        fetch: { includeHttpResponseReturnType: false },
        mock: { baseUrl: '/api/v1' },
      },
    },
  },
  kowabungaZod: {
    input: { target: './openapi/openapi.yaml' },
    output: {
      mode: 'tags-split',
      target: './src/api/generated/zod',
      client: 'zod',
      fileExtension: '.zod.ts',
      clean: true,
    },
  },
})
