# Copyright (c) The Kowabunga Project
# Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
# SPDX-License-Identifier: Apache-2.0

.DEFAULT_GOAL := help

PACKAGE = kowabunga-koala

# Release version: latest git tag (1.2.3 or v1.2.3), falling back to package.json.
VERSION ?= $(shell git describe --tags --abbrev=0 2>/dev/null | sed 's/^v//' || true)
ifeq ($(VERSION),)
  VERSION := $(shell node -p "require('./package.json').version")
endif

# Kahuna backend used by `make dev` (proxied under /api).
KAHUNA_URL ?= https://labs.kowabunga.cloud

# OpenAPI spec: released version from kowabunga-cloud/openapi, or a local file via OPENAPI_SPEC.
OPENAPI_VERSION ?= $(shell node -p "require('./package.json').config.openapiVersion")
OPENAPI_URL = https://raw.githubusercontent.com/kowabunga-cloud/openapi/refs/tags/v$(OPENAPI_VERSION)/openapi.yaml
OPENAPI_SPEC ?=
OPENAPI_FILE = openapi/openapi.yaml

DIST_DIR = dist
RELEASE_TGZ = $(PACKAGE)-$(VERSION).tgz

V = 0
Q = $(if $(filter 1,$V),,@)
M = $(shell printf "\033[34;1m▶\033[0m")

.PHONY: help
help: ## Show this help
	@awk 'BEGIN {FS = ":.*?## "} /^##@/ {printf "\n\033[1m%s\033[0m\n", substr($$0, 5)} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

##@ Development

node_modules: package.json package-lock.json
	$(info $(M) installing dependencies…)
	$Q npm ci
	$Q touch $@

.PHONY: install
install: node_modules ## Install dependencies

.PHONY: dev
dev: node_modules ## Run dev server, /api proxied to KAHUNA_URL (default: labs.kowabunga.cloud)
	$Q KAHUNA_URL=$(KAHUNA_URL) npx vite

.PHONY: dev-mock
dev-mock: node_modules ## Run dev server with fake data generated from the spec (no backend)
	$Q VITE_MOCK=true npx vite

##@ API

.PHONY: api-fetch
api-fetch: ## Fetch the OpenAPI spec (OPENAPI_VERSION=x.y.z to switch version, OPENAPI_SPEC=path for a local file)
ifneq ($(OPENAPI_SPEC),)
	$(info $(M) using local OpenAPI spec $(OPENAPI_SPEC)…)
	$Q cp $(OPENAPI_SPEC) $(OPENAPI_FILE)
else
	$(info $(M) fetching OpenAPI spec v$(OPENAPI_VERSION)…)
	$Q curl -fsSL $(OPENAPI_URL) -o $(OPENAPI_FILE)
	$Q npm pkg set config.openapiVersion=$(OPENAPI_VERSION)
endif

.PHONY: api-generate
api-generate: node_modules ## Regenerate the API client from openapi/openapi.yaml
	$(info $(M) generating API client…)
	$Q npx orval

.PHONY: api-update
api-update: api-fetch api-generate typecheck ## Fetch spec, regenerate client and type-check the app against it

.PHONY: api-check
api-check: api-generate ## Fail if the committed generated client is out of date
	$Q git diff --exit-code --stat -- src/api/generated || { echo "generated API client is stale: run 'make api-generate' and commit"; exit 1; }

##@ Quality

.PHONY: lint
lint: node_modules ## Lint sources
	$Q npx oxlint

.PHONY: typecheck
typecheck: node_modules ## Type-check sources
	$Q npx tsc -b

.PHONY: check
check: lint typecheck ## Lint and type-check

##@ Build & release

.PHONY: build
build: node_modules ## Production build into dist/
	$(info $(M) building $(VERSION)…)
	$Q npx tsc -b
	$Q npx vite build

.PHONY: preview
preview: build ## Serve the production build locally (no API proxy)
	$Q npx vite preview

.PHONY: release
release: ## Create release tarball from dist/
	$(info $(M) creating $(RELEASE_TGZ)…)
	$Q test -f $(DIST_DIR)/index.html || { echo "no build found, run 'make build' first"; exit 1; }
	$Q rm -rf koala && cp -R $(DIST_DIR) koala
	$Q tar czf $(RELEASE_TGZ) koala
	$Q rm -rf koala

.PHONY: deb
deb: ## Build Debian package from dist/ (needs debhelper, fakeroot)
	$(info $(M) building Debian package $(VERSION)…)
	$Q test -f $(DIST_DIR)/index.html || { echo "no build found, run 'make build' first"; exit 1; }
	$Q VERSION=$(VERSION) ./debian.sh

.PHONY: clean
clean: ## Remove build outputs
	$Q rm -rf $(DIST_DIR) $(PACKAGE)-*.tgz debian/changelog debian/.debhelper debian/$(PACKAGE) debian/files debian/*.substvars debian/*.log node_modules/.tmp

.PHONY: distclean
distclean: clean ## Also remove dependencies
	$Q rm -rf node_modules
