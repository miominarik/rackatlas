#!/usr/bin/env bash
#
# Installs the RackAtlas agent on Debian or Ubuntu.
#
#   curl -fsSL https://your-rackatlas/agent/install.sh | sudo bash -s -- --url https://your-rackatlas --token ra_...
#
# It adds the signed RackAtlas apt repository, installs the package rackatlas-agent
# from it, writes the address and the token to /etc/rackatlas-agent/agent.conf and
# starts the systemd timer. From then on the agent is updated with the system:
#
#   sudo apt update && sudo apt install --only-upgrade rackatlas-agent
#
# The token can also come from the environment variable RACKATLAS_TOKEN, which keeps
# it out of the process list.

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
  apt-get install -y -qq curl ca-certificates >/dev/null
fi

KEYRING=/etc/apt/keyrings/rackatlas.gpg
SOURCE=/etc/apt/sources.list.d/rackatlas.list

echo "Adding the RackAtlas repository from $URL/apt ..."
mkdir -p /etc/apt/keyrings
curl -fsSL --max-time 60 "$URL/apt/rackatlas.gpg" -o "$KEYRING.new" \
  || fail "Could not download the repository key from $URL/apt/rackatlas.gpg"
chmod 644 "$KEYRING.new"
mv "$KEYRING.new" "$KEYRING"
printf 'deb [signed-by=%s] %s/apt stable main\n' "$KEYRING" "$URL" > "$SOURCE"

echo "Installing the package..."
# Only the RackAtlas source is refreshed, a broken repository elsewhere does not matter here.
apt-get update -qq \
  -o Dir::Etc::sourcelist="sources.list.d/rackatlas.list" \
  -o Dir::Etc::sourceparts="-" \
  -o APT::Get::List-Cleanup="0" \
  || fail "apt could not read the repository. Check that $URL/apt/dists/stable/InRelease opens."
apt-get install -y -qq rackatlas-agent >/dev/null \
  || fail "apt could not install rackatlas-agent."

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
