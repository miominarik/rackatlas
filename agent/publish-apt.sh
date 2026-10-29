#!/bin/sh
#
# Builds the agent package and adds it to the signed apt repository in public/apt.
#
#   agent/publish-apt.sh KEYID        sign with this GPG key
#   agent/publish-apt.sh --no-sign    only to try it out
#   agent/publish-apt.sh --resign KEYID    no new package, only rebuild the indexes and sign them again
#
# Run it on your own computer after raising the version in agent/VERSION, then commit
# public/apt. The private key never leaves your computer, the server only serves files.

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO="$SCRIPT_DIR/../public/apt"

# gpg asks for the passphrase on this terminal.
GPG_TTY="$(tty 2>/dev/null || true)"
export GPG_TTY

case "${1:-}" in
  "") echo "Usage: agent/publish-apt.sh KEYID | --no-sign | --resign KEYID" >&2; exit 1 ;;
  --resign)
    [ -n "${2:-}" ] || { echo "Usage: agent/publish-apt.sh --resign KEYID" >&2; exit 1; }
    exec python3 "$SCRIPT_DIR/apt-repo.py" --repo "$REPO" --key "$2"
    ;;
  --no-sign) SIGN="--no-sign" ;;
  *) SIGN="--key $1" ;;
esac

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

sh "$SCRIPT_DIR/build-deb.sh" "$WORK" >/dev/null

# shellcheck disable=SC2086
python3 "$SCRIPT_DIR/apt-repo.py" --deb "$WORK/rackatlas-agent.deb" --repo "$REPO" $SIGN
