#!/bin/sh
#
# Builds the Debian/Ubuntu package of the agent.
#
#   agent/build-deb.sh [output directory]      (default: public/agent)
#
# Uses dpkg-deb when it exists (CI). Without it (macOS) the same package is put
# together by hand with tar and ar, so it can be checked locally.

set -eu

cd "$(dirname "$0")"

VERSION="$(cat VERSION)"
OUT="${1:-../public/agent}"
mkdir -p "$OUT"
OUT="$(cd "$OUT" && pwd)/rackatlas-agent.deb"

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

cp -R package/. "$STAGE/"

for file in DEBIAN/control usr/bin/rackatlas-agent; do
  sed "s/@VERSION@/$VERSION/g" "$STAGE/$file" > "$STAGE/$file.tmp"
  mv "$STAGE/$file.tmp" "$STAGE/$file"
done

find "$STAGE" -type d -exec chmod 755 {} +
find "$STAGE" -type f -exec chmod 644 {} +
chmod 755 "$STAGE/DEBIAN/postinst" "$STAGE/DEBIAN/prerm" "$STAGE/DEBIAN/postrm" "$STAGE/usr/bin/rackatlas-agent"

rm -f "$OUT"

if command -v dpkg-deb >/dev/null 2>&1; then
  dpkg-deb --root-owner-group --build "$STAGE" "$OUT" >/dev/null
else
  export COPYFILE_DISABLE=1

  if tar --version 2>/dev/null | grep -q 'GNU tar'; then
    TAR_OWNER="--owner=0 --group=0 --numeric-owner"
  else
    TAR_OWNER="--uid 0 --gid 0 --uname root --gname root"
  fi

  WORK="$(mktemp -d)"
  trap 'rm -rf "$STAGE" "$WORK"' EXIT

  # shellcheck disable=SC2086
  (cd "$STAGE/DEBIAN" && tar $TAR_OWNER -czf "$WORK/control.tar.gz" .)
  rm -rf "$STAGE/DEBIAN"
  # shellcheck disable=SC2086
  (cd "$STAGE" && tar $TAR_OWNER -czf "$WORK/data.tar.gz" .)
  printf '2.0\n' > "$WORK/debian-binary"

  (cd "$WORK" && ar rcS "$OUT" debian-binary control.tar.gz data.tar.gz)
fi

echo "Built $OUT (version $VERSION)"
