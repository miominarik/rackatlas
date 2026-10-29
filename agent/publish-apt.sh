#!/bin/sh
#
# Builds the agent package and adds it to the signed apt repository in public/apt.
#
#   agent/publish-apt.sh              sign with the key in agent/SIGNING_KEY
#   agent/publish-apt.sh KEYID        sign with another GPG key
#   agent/publish-apt.sh --no-sign    only to try it out
#   agent/publish-apt.sh --resign [KEYID]    no new package, only rebuild the indexes and sign them again
#
# agent/SIGNING_KEY holds the fingerprint of the signing key. A fingerprint is public, only the
# private key (kept in your GPG keyring and in your backup) is secret.
#
# Run it on your own computer after raising the version in agent/VERSION, then commit
# public/apt. The private key never leaves your computer, the server only serves files.

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO="$SCRIPT_DIR/../public/apt"

# gpg asks for the passphrase on this terminal.
GPG_TTY="$(tty 2>/dev/null || true)"
export GPG_TTY

default_key() {
  [ -r "$SCRIPT_DIR/SIGNING_KEY" ] || { echo "Give a key id or put the fingerprint into agent/SIGNING_KEY" >&2; exit 1; }
  tr -d ' \n' < "$SCRIPT_DIR/SIGNING_KEY"
}

case "${1:-}" in
  --resign)
    exec python3 "$SCRIPT_DIR/apt-repo.py" --repo "$REPO" --key "${2:-$(default_key)}"
    ;;
  --no-sign) SIGN="--no-sign" ;;
  "") SIGN="--key $(default_key)" ;;
  *) SIGN="--key $1" ;;
esac

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

sh "$SCRIPT_DIR/build-deb.sh" "$WORK" >/dev/null

# shellcheck disable=SC2086
python3 "$SCRIPT_DIR/apt-repo.py" --deb "$WORK/rackatlas-agent.deb" --repo "$REPO" $SIGN
