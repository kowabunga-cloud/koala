# Copyright (c) The Kowabunga Project
# Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
# SPDX-License-Identifier: Apache-2.0

VERSION=0.2.4

V = 0
Q = $(if $(filter 1,$V),,@)
M = $(shell printf "\033[34;1m▶\033[0m")

# This is our default target
# it do all the steps required to build the debian package
# it does not build/run the tests
.PHONY: all
all: node ; @ ## Do all
	$Q echo "done"

.PHONY: node
node:
	$Q npm install --legacy-peer-deps

.PHONY: upgrade
upgrade:
	$Q npm install -g npm-check-updates
	$Q ncu --upgrade

.PHONY: run
run:
	$Q npm run dev

.PHONY: dist
dist:
	$Q npm run build:prod

.PHONY: release
release:
	$Q cp -rf dist koala
	$Q tar czf kowabunga-koala-$(VERSION).tgz koala/*
	$Q rm -rf koala

.PHONY: deb
deb: ; $(info $(M) building debian package…) @
	$Q VERSION=$(VERSION) ./debian.sh

.PHONY: clean
clean:
	$Q rm -rf node_modules .angular dist package-lock.json
