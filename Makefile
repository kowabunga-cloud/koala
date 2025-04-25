# Copyright (c) The Kowabunga Project
# Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
# SPDX-License-Identifier: Apache-2.0

VERSION=0.2.3

V = 0
Q = $(if $(filter 1,$V),,@)
M = $(shell printf "\033[34;1m▶\033[0m")

# This is our default target
# it do all the steps required to build the debian package or docker image
# it does not build/run the tests
.PHONY: all
all: node ; @ ## Do all
	$Q echo "done"

.PHONY: node
node:
	npm install --legacy-peer-deps

.PHONY: upgrade
upgrade:
	npm install -g npm-check-updates
	ncu --upgrade

.PHONY: run
run:
	npm run dev

.PHONY: dist
dist:
	npm run build:prod

.PHONY: deb
deb: ; $(info $(M) building debian package…) @ ## Build debian package
	$Q VERSION=$(VERSION) ./debian.sh

.PHONY: clean
clean:
	rm -rf node_modules .angular dist package-lock.json
