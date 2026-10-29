#!/usr/bin/env bash
#
# Installs the RackAtlas agent on Debian or Ubuntu.
#
#   curl -fsSL https://your-rackatlas/agent/install.sh | sudo bash -s -- --url https://your-rackatlas --token ra_...
#
# It installs the package rackatlas-agent, writes the address and the token to
# /etc/rackatlas-agent/agent.conf and starts the systemd timer. The token can also
# come from the environment variable RACKATLAS_TOKEN, which keeps it out of the
# process list.

set -euo pipefail

URL=""
TOKEN="${RACKATLAS_TOKEN:-}"

fail() {
  echo "Error: $*" >&2
  exit 1
}

while [ $# -gt 0 ]; do
  case "$1" in
    --url) URL="${2:-}"; shift 2 ;;
    --token) TOKEN="${2:-}"; shift 2 ;;
    *) fail "Unknown option: $1" ;;
  esac
done

URL="${URL%/}"

[ -n "$URL" ] || fail "Missing --url"
[ -n "$TOKEN" ] || fail "Missing --token"

case "$URL" in
  https://*) ;;
  http://localhost*|http://127.0.0.1*) ;;
  http://*) fail "The address has to start with https:// so the token is not sent in plain text." ;;
  *) fail "The address has to start with https://" ;;
esac

echo "$TOKEN" | grep -Eq '^ra_[A-Za-z0-9]{40}$' || fail "The token does not look right. Copy the whole command from RackAtlas."

[ "$(id -u)" -eq 0 ] || fail "Run this as root, for example with sudo."
command -v apt-get >/dev/null 2>&1 || fail "This installer needs Debian or Ubuntu (apt)."
[ -d /run/systemd/system ] || fail "This installer needs systemd."

export DEBIAN_FRONTEND=noninteractive

if ! command -v curl >/dev/null 2>&1; then
  echo "Installing curl..."
  apt-get update -qq
  apt-get install -y -qq curl >/dev/null
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
chmod 755 "$TMP"

echo "Downloading the agent from $URL ..."
curl -fsSL --max-time 60 "$URL/agent/rackatlas-agent.deb" -o "$TMP/rackatlas-agent.deb" \
  || fail "Could not download $URL/agent/rackatlas-agent.deb"

echo "Installing the package..."
apt-get install -y -qq "$TMP/rackatlas-agent.deb" >/dev/null

echo "Writing the configuration..."
umask 027
printf 'URL=%s\nTOKEN=%s\n' "$URL" "$TOKEN" > /etc/rackatlas-agent/agent.conf
chown root:rackatlas-agent /etc/rackatlas-agent/agent.conf
chmod 640 /etc/rackatlas-agent/agent.conf

systemctl daemon-reload
systemctl enable --now rackatlas-agent.timer >/dev/null 2>&1

echo "Sending the first report..."
if systemctl start rackatlas-agent.service; then
  echo "Done. The agent reports every minute. RackAtlas shows the server in a moment."
else
  echo "The first report failed. Last messages of the agent:" >&2
  journalctl -u rackatlas-agent.service -n 8 --no-pager >&2 || true
  exit 1
fi
