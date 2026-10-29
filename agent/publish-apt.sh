#!/bin/sh
#
# Builds the agent package and adds it to the signed apt repository in public/apt.
#
#   agent/publish-apt.sh KEYID        sign with this GPG key
#   agent/publish-apt.sh --no-sign    only to try it out
#
# Run it on your own computer after raising the version in agent/VERSION, then commit
# public/apt. The private key never leaves your computer, the server only serves files.

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO="$SCRIPT_DIR/../public/apt"

case "${1:-}" in
  "") echo "Usage: agent/publish-apt.sh KEYID | --no-sign" >&2; exit 1 ;;
  --no-sign) SIGN="--no-sign" ;;
  *) SIGN="--key $1" ;;
esac

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

sh "$SCRIPT_DIR/build-deb.sh" "$WORK" >/dev/null

# shellcheck disable=SC2086
python3 "$SCRIPT_DIR/apt-repo.py" --deb "$WORK/rackatlas-agent.deb" --repo "$REPO" $SIGN
