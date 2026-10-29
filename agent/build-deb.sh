#!/bin/sh
#
# Builds the Debian/Ubuntu package of the agent.
#
#   agent/build-deb.sh [output directory]      (default: public/agent)
#
# Uses dpkg-deb when it exists (CI). Without it (macOS) the same package is put
# together by hand with tar and ar, so it can be checked locally.

set -eu

# Everything is resolved before changing directory, so a relative output path
# (like the one the deploy workflow passes) means "relative to where you run it".
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUT_DIR="${1:-$SCRIPT_DIR/../public/agent}"
mkdir -p "$OUT_DIR"
OUT="$(cd "$OUT_DIR" && pwd)/rackatlas-agent.deb"
VERSION="$(cat "$SCRIPT_DIR/VERSION")"

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

cp -R "$SCRIPT_DIR/package/." "$STAGE/"

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
    # bsdtar (macOS) adds PAX extended headers with the extended attributes of the files, and
    # dpkg refuses such an archive ("unsupported PAX tar header type 'x'"). Plain ustar has none.
    TAR_OWNER="--uid 0 --gid 0 --uname root --gname root --format ustar --no-xattrs --no-acls --no-fflags"
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
