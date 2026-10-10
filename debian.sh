#!/bin/bash
# Builds the Debian package from an existing dist/ (see `make deb`).
set -euo pipefail

: "${VERSION:?VERSION must be set}"

CURRENT=$(git describe --tags --abbrev=0 2>/dev/null || true)
PREVIOUS=$(git describe --tags --abbrev=0 "${CURRENT}^" 2>/dev/null || true)
if [ -n "${PREVIOUS}" ]; then
  CHANGES=$(git log --pretty="  * %s" "${PREVIOUS}..${CURRENT}")
else
  CHANGES="  * Release ${VERSION}"
fi

cat > debian/changelog <<CHANGELOG
kowabunga-koala (${VERSION}) unstable; urgency=medium

${CHANGES}

 -- The Kowabunga Project <maintainers@kowabunga.cloud>  $(date -R)
CHANGELOG

# -d: nothing is compiled (dist/ is prebuilt), so skip the build-essential dependency check
dpkg-buildpackage -b -us -uc -d
