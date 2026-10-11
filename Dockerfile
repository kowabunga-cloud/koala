# syntax=docker/dockerfile:1
# Copyright (c) The Kowabunga Project
# Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
# SPDX-License-Identifier: Apache-2.0

# Kowabunga Koala web UI: static files served by static-web-server, on a
# scratch image.
#
#   docker build -t koala .
#   docker run -p 8080:8080 koala
#
# Koala calls the Kahuna API under /api/v1 on the same origin: route /api
# to Kahuna in front of it (e.g. Kubernetes Ingress, reverse proxy).
# static-web-server settings can be overridden through SERVER_* environment
# variables (see https://static-web-server.net/configuration/environment-variables/).

# static files are platform-independent: built once, on the build platform
FROM --platform=$BUILDPLATFORM node:24-alpine@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1 AS build

WORKDIR /src
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

COPY . .
RUN npm run build

FROM ghcr.io/static-web-server/static-web-server:2.44.0@sha256:2c1a7c3e0feaea5859307403b74e1c575f3ec1499094fc077344173d11abaae2 AS server

FROM scratch

COPY --from=server /static-web-server /static-web-server
COPY --from=build /src/dist /public
COPY docker/static-web-server.toml /etc/static-web-server.toml

ENV SERVER_ROOT=/public \
    SERVER_PORT=8080 \
    SERVER_FALLBACK_PAGE=/public/index.html \
    SERVER_HEALTH=true \
    SERVER_COMPRESSION=true \
    SERVER_SECURITY_HEADERS=true \
    SERVER_CACHE_CONTROL_HEADERS=false \
    SERVER_CONFIG_FILE=/etc/static-web-server.toml \
    SERVER_LOG_LEVEL=info

USER 65532:65532
EXPOSE 8080
STOPSIGNAL SIGQUIT
ENTRYPOINT ["/static-web-server"]
