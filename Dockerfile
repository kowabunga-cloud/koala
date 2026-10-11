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
FROM --platform=$BUILDPLATFORM node:25-alpine@sha256:bdf2cca6fe3dabd014ea60163eca3f0f7015fbd5c7ee1b0e9ccb4ced6eb02ef4 AS build

WORKDIR /src
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

COPY . .
RUN npm run build

FROM ghcr.io/static-web-server/static-web-server:2.44.1@sha256:94618e3d17802265a21926217e6f9e7832b311b6fbf5933684001739fafed06a AS server

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
