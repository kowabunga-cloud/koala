<p align="center">
  <a href="https://www.kowabunga.cloud/?utm_source=github&utm_medium=logo" target="_blank">
    <picture>
      <source srcset="https://raw.githubusercontent.com/kowabunga-cloud/infographics/master/art/kowabunga-title-white.png" media="(prefers-color-scheme: dark)" />
      <source srcset="https://raw.githubusercontent.com/kowabunga-cloud/infographics/master/art/kowabunga-title-black.png" media="(prefers-color-scheme: light), (prefers-color-scheme: no-preference)" />
      <img src="https://raw.githubusercontent.com/kowabunga-cloud/infographics/master/art/kowabunga-title-black.png" alt="Kowabunga" width="800">
    </picture>
  </a>
</p>

# Official Web Client for Kowabunga

This is **Koala**, the official Web client for Kowabunga: a React single-page application generated from the [Kowabunga OpenAPI](https://github.com/kowabunga-cloud/openapi) specification.

[![License: Apache License, Version 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://spdx.org/licenses/Apache-2.0.html)
[![Build Status](https://github.com/kowabunga-cloud/koala/actions/workflows/release.yml/badge.svg)](https://github.com/kowabunga-cloud/koala/actions/workflows/release.yml)

## Current Releases

| Project            | Release Badge                                                                                       |
|--------------------|-----------------------------------------------------------------------------------------------------|
| **Kowabunga**           | [![Kowabunga Release](https://img.shields.io/github/v/release/kowabunga-cloud/kowabunga)](https://github.com/kowabunga-cloud/kowabunga/releases) |
| **Kowabunga JavaScript SDK**     | [![Kowabunga JavaScript SDK Release](https://img.shields.io/github/v/release/kowabunga-cloud/kowabunga-javascript)](https://github.com/kowabunga-cloud/kowabunga-javascript/releases) |
| **Kowabunga Koala**     | [![Kowabunga Koala Release](https://img.shields.io/github/v/release/kowabunga-cloud/koala)](https://github.com/kowabunga-cloud/koala/releases) |

## Installation

`koala` application must be served by a proper Web server. It can be installed by either:

- extracting release content in a directory of your choice (e.g. **/var/www/kowabunga**)
- using **dpkg** or **apt** command on Debian/Ubuntu, e.g.:

```console
$ apt-get install kowabunga-koala
```

Check out the [list of released versions](https://github.com/kowabunga-cloud/koala/releases).

## Configuration

Koala can be exposed through any Web server.

Here's a few to do so through [Nginx](https://nginx.org/), provided **Kowabunga Kahuna engine** is running on 127.0.0.1:8080 and **Koala** content being hosted in **/var/www/kowabunga** directory.

```html
server {
  server_name kowabunga.acme.com;
  server_tokens off;
  listen 443 ssl http2;

  ssl_certificate /etc/nginx/ssl/kowabunga.acme.com/cert.pem;
  ssl_certificate_key /etc/nginx/ssl/kowabunga.acme.com/key.pem;

  ssl_session_cache shared:le_nginx_SSL:10m;
  ssl_session_timeout 1d;
  ssl_session_cache shared:MozSSL:10m;  # about 40000 sessions
  ssl_session_tickets off;

  ssl_protocols TLSv1.3;
  ssl_prefer_server_ciphers off;

  # HSTS
  add_header Strict-Transport-Security "max-age=63072000" always;

  # OCSP stapling
  ssl_stapling on;
  ssl_stapling_verify on;

  # Timeouts
  keepalive_timeout 1h;
  send_timeout 1h;
  client_body_timeout 1h;
  client_header_timeout 1h;

  etag on;

  # Error Pages
  error_page 404 /404.html;
  location = /404.html {
    root /var/www/html;
    internal;
  }

  # Koala (single-page app: unknown paths fall back to index.html)
  root /var/www/kowabunga;
  location / {
    try_files $uri /index.html;
  }

  # Kowabunga Orchestrator
  location ~ (/api|/confirm|/confirmForgotPassword|/latest) {
    proxy_pass http://127.0.0.1:8080$request_uri;
    proxy_set_header Host $host;
    proxy_connect_timeout 1h;
    proxy_read_timeout 1h;
    proxy_send_timeout 1h;
  }

  location ~ (/ws) {
    proxy_pass http://127.0.0.1:8080$request_uri;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
  }
}
```

alternatively you can do the same in a much more elegant way with [Caddy](https://caddyserver.com/):

```
kowabunga.acme.com {
  encode

  @api path /api/* /confirm /confirmForgotPassword /latest/meta-data
  @ws {
    path /ws
    header Connection *Upgrade*
    header Upgrade    websocket
  }

  # Kahuna Orchestrator
  handle @api {
    reverse_proxy 127.0.0.1:8080
  }
  handle @ws {
    reverse_proxy @ws 127.0.0.1:8080
  }
  # Koala WebUI
  handle {
    root * /var/www/kowabunga
    try_files {path} /index.html
    file_server
  }
}
```

## Development

| Concern | Choice |
|---|---|
| Build | Vite + TypeScript |
| API client | [Orval](https://orval.dev), generated from the Kowabunga OpenAPI spec |
| Server state | TanStack Query |
| Routing | TanStack Router (file-based, `src/routes/`) |
| UI | shadcn/ui (Tailwind + Radix), components live in `src/components/ui/` |
| Forms | react-hook-form + Zod schemas generated from the spec |
| Mocks | MSW handlers generated from the spec |

### Running locally

```console
$ make help                                     # list all targets
$ make dev                                      # /api proxied to https://labs.kowabunga.cloud
$ make dev KAHUNA_URL=http://127.0.0.1:8080     # or any other Kahuna
$ make dev-mock                                 # no backend: fake data generated from the spec
$ make check                                    # lint + type-check
$ make build                                    # production bundle in dist/
```

In mock mode any email/password signs you in as `superAdmin`.

### How the API is wired

```
kowabunga-cloud/openapi  ──(api:fetch, pinned tag)──▶  openapi/openapi.yaml
                                                             │
                                                     orval (api:generate)
                                                             ▼
src/api/generated/
  model/                  TypeScript types (Kaktus, Subnet, …)
  endpoints/<tag>/<tag>.ts       fetch functions + useXxx() query/mutation hooks
  endpoints/<tag>/<tag>.msw.ts   MSW mock handlers
  zod/<tag>/<tag>.zod.ts         Zod schemas for request/response bodies
```

- The spec version is pinned in `package.json` → `config.openapiVersion`. To move to a new API
  version run `make api-update OPENAPI_VERSION=x.y.z`: it fetches the spec, regenerates the client and
  type-checks the app, so breaking changes show up as type errors.
- To try an unreleased spec: `make api-fetch api-generate OPENAPI_SPEC=../openapi/openapi.yaml`.
- CI runs `make api-check`, which fails if the committed client doesn't match the committed spec.
- Generated code is committed so spec bumps are reviewable as diffs. Never edit it by hand.
- Every request goes through `src/api/client.ts` (base URL `/api/v1`, `Authorization: Bearer <jwt>`,
  sign-out on 401, errors thrown as `ApiError`).
- `GET` operations become `useXxx()` queries, everything else `useXxx()` mutations:

```tsx
const { data: kaktus } = useReadKaktus(id)
const enable = useEnableKaktusMaintenance({
  mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getReadKaktusQueryKey(id) }) },
})
enable.mutate({ kaktusId: id })
```

### Adding a page

1. Create `src/routes/_app/<name>.tsx` (the route tree is regenerated automatically).
2. Add it to `NAV` in `src/components/app-sidebar.tsx`.
3. Use `useScope()` for the current project/region/zone and the generated hooks for data.

`src/routes/_app/kaktus.tsx` is the reference implementation.

## Release

Pushing a tag (e.g. `0.3.0`) runs `.github/workflows/release.yml`: check, build, then `make release`
(`kowabunga-koala-<version>.tgz`) and `make deb` (`kowabunga-koala_<version>_all.deb`, installs into
`/var/www/kowabunga`), published as a GitHub release and pushed to the APT repository.

## License

Licensed under [Apache License, Version 2.0](https://opensource.org/license/apache-2-0), see [`LICENSE`](LICENSE).
