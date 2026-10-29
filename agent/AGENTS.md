# RackAtlas agent: how to change it

The agent is a small POSIX shell program that runs on the monitored Debian/Ubuntu servers, collects
metrics and serious log entries and pushes them to RackAtlas over HTTPS. Nothing connects into the
server. It is shipped as the `.deb` package `rackatlas-agent` from our own signed apt repository
(`public/apt`). Read this file before changing anything in `agent/`, `public/agent/` or `public/apt/`.

## Layout

| Path                                                               | What it is                                                                                                         |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `agent/VERSION`                                                    | The version, one line (`1.1.0`). Substituted for `@VERSION@` in the script and in `DEBIAN/control`.                |
| `agent/package/usr/bin/rackatlas-agent`                            | The agent itself (POSIX `sh`).                                                                                     |
| `agent/package/lib/systemd/system/rackatlas-agent.{service,timer}` | Runs the agent once a minute as the user `rackatlas-agent`.                                                        |
| `agent/package/DEBIAN/{control,postinst,prerm,postrm}`             | Package metadata and maintainer scripts.                                                                           |
| `agent/build-deb.sh [dir]`                                         | Builds the `.deb` (`dpkg-deb`, or `tar` + `ar` on macOS).                                                          |
| `agent/apt-repo.py`                                                | Adds a `.deb` to the apt repository, writes the indexes, signs them with GPG, verifies the result.                 |
| `agent/publish-apt.sh KEYID`                                       | Build + publish in one step, writes `public/apt`.                                                                  |
| `public/agent/install.sh`                                          | The installer users run with `curl ... \| sudo bash`: adds the repository, installs the package, writes the token. |
| `public/apt/`                                                      | The published repository (committed, served as static files).                                                      |

Server side (Laravel): `routes/api.php` (`POST /api/agent/ingest`), `app/Http/Middleware/AuthenticateAgent.php`,
`app/Http/Controllers/Api/AgentIngestController.php`, `app/Services/Ssh/{AgentIngestor,MetricsParser,LogParser}.php`,
`app/Http/Controllers/Servers/ServerAgentController.php` and `resources/js/pages/servers/agent.tsx` (install page).

## Rules for the script

- **POSIX `sh` only.** No bashisms (`[[ ]]`, arrays, `local` is tolerated by dash but avoid it, process substitution).
  The shebang is `#!/bin/sh` and on Debian it is `dash`. Keep `set -u`. Use only coreutils, `awk`, `sed`,
  `grep`, `curl`, `journalctl`, `systemctl`, `df`. Do not add dependencies; if one is unavoidable, add it to
  `Depends:` in `DEBIAN/control` and say why.
- **Never execute or `source` the config.** `agent.conf` is parsed line by line and only `URL` and `TOKEN` are read.
- **The token is a secret.** Never print it, never log it, never put it in a process list or a URL. It is only
  sent as `Authorization: Bearer`. The URL must be `https://` (the installer enforces this).
- **Runs unprivileged and sandboxed** (see the `.service`: `ProtectSystem=strict`, `PrivateTmp`, `NoNewPrivileges`, ...).
  The only writable place is `/var/lib/rackatlas-agent` (`StateDirectory`). Reading the journal works through
  the `systemd-journal` group. If a new feature needs more access, relax the unit as little as possible.
- **Be fast and bounded.** It runs every minute; `TimeoutStartSec=45`, `curl --max-time 25`. Cap the amount
  of data (`MAX_LOG_LINES`, `head -n`), and the server rejects reports over 256 KB.
- **Never lose or duplicate data.** Journal cursors are written to the state directory only after the server
  answered 2xx. Keep that order. The CPU value is an average over the time since the previous run
  (`cpu-prev` state), with a one second sample as the fallback.
- **`LC_ALL=C`** is exported so the output of tools is parseable. Keep it.
- No unit tests are written in this project (standing instruction of the owner). Verify with the steps below.

## The report format is a contract with the server

The agent sends plain text split into `###SECTION` blocks: `CPU1`, `CPU2`, `LOAD`, `CORES`, `MEM`, `UPTIME`,
`DISK`, `JOURNAL_CRITICAL`, `JOURNAL_ERROR`, `FAILED_UNITS`. The server parses them in `MetricsParser`
(`sections()` matches `^###([A-Z0-9_]+)$`) and `LogParser`. The same sections are produced for servers that
are monitored over SSH by `MetricsParser::SCRIPT`, so metrics sections must stay identical in both.

- **Old agents stay installed for a long time** (servers update when their admin runs `apt upgrade`).
  The server must keep accepting every report format ever released. Add new data as a new, optional
  section and make the parser tolerate its absence. Never rename or drop a required section
  (`CPU1 CPU2 LOAD CORES MEM UPTIME`) without a long compatibility period.
- Change both sides in the same change: agent script, parser/ingestor, and (if it is stored) a migration,
  model, and the UI that shows it (`resources/js`), plus translations in `lang/sk.json` and `lang/cs.json`.
- The agent version arrives in the `X-Agent-Version` header and is stored on the server. Use it if the server
  has to behave differently for old agents.
- The rate limit (`AppServiceProvider`, `throttle:agent`) is 10 requests per minute per token. A new feature
  must not send more than one request per run.

## Releasing a new version

1. Change the files under `agent/package/`.
2. Raise `agent/VERSION` (semver: patch for fixes, minor for new data/features, major for breaking changes).
   Every change to the package needs a new version, otherwise apt clients never see it.
3. Update the server side if the report format changed (see above).
4. **Stop here and hand over to the owner.** Publishing needs the owner's GPG private key (its public fingerprint is in `agent/SIGNING_KEY`, the script uses it by default), which must never be
   created, read, exported or used by an AI session, and the owner commits and pushes themselves. Tell them to run:
    ```bash
    agent/publish-apt.sh
    git add public/apt agent public/agent
    ```
    Then commit, push and deploy. Servers get the update with `sudo apt update && sudo apt upgrade`.
5. A published version is immutable: `apt-repo.py` refuses a different file with the same version, and a version
   that is not newer than the published one. Do not work around this with `--replace` / `--allow-older`
   unless the owner asks for it explicitly.

A CDN or cache in front of the site (Cloudflare "Cache Everything") must not cache `/apt/dists/`. A client that gets
an old `InRelease` next to a new `Packages` fails with "File has unexpected size". After each publish, purge the cache
of `/apt/dists/*` if the site is cached. `public/apt/.htaccess` sends `Cache-Control: no-cache` for these files.

Never leave a test or unsigned repository in `public/apt`. Test into a temporary directory (below).

## Package rules (`DEBIAN/`)

- `Architecture: all` (shell script), so `apt-repo.py` lists it for amd64, arm64, armhf and i386.
- Maintainer scripts must be **idempotent and upgrade safe**: they run on install, upgrade and purge.
  Use `set -e`, guard `systemctl` with `|| true`, and check `[ -d /run/systemd/system ]` first.
- `agent.conf` is created by `postinst` only when it does not exist, so an upgrade never overwrites the token.
  The installer writes the real values. Do not make it a dpkg conffile without thinking about the token.
- `purge` removes `/etc/rackatlas-agent`, `/var/lib/rackatlas-agent` and the system user. `remove` keeps them.
- Compression of the `.deb` must be gzip or xz (`apt-repo.py` reads those with the standard library).
- The archives inside the `.deb` must be plain **ustar**, owned by root (uid/gid 0). `bsdtar` on macOS adds PAX
  extended headers with extended attributes (`LIBARCHIVE.xattr.com.apple.provenance`) and dpkg then fails with
  "unsupported PAX tar header type 'x'". `build-deb.sh` avoids this (`--format ustar --no-xattrs`) and
  `apt-repo.py` refuses a package that still has such headers or wrong owners. Never publish a `.deb` that was
  built another way, and never edit a `.deb` by hand.

## Testing without a Debian machine

There is no Debian here (macOS), so test in pieces, never against the production database or `.env`:

- **Script:** `RACKATLAS_PROC=/path/to/fake/proc RACKATLAS_STATE=/tmp/x RACKATLAS_CONF=/tmp/conf sh agent/package/usr/bin/rackatlas-agent --dry-run`
  prints the report without sending. The three variables replace `/proc`, the state directory and the config.
  Fake `curl`, `journalctl` and `systemctl` with scripts earlier in `PATH` to test the sending and the cursors.
- **Package:** `sh agent/build-deb.sh "$(mktemp -d)"`.
- **Repository:** `python3 agent/apt-repo.py --deb <deb> --repo "$(mktemp -d)" --no-sign` checks the structure and
  the hashes. With a throwaway key (`GNUPGHOME=$(mktemp -d)`, `gpg --batch --passphrase '' --quick-generate-key ...`)
  it also checks the signature. Delete everything afterwards.
- **Server side:** feed a sample report to `AgentIngestor::ingest()` with a local SQLite database
  (`DB_CONNECTION=sqlite DB_DATABASE=<absolute path> CACHE_STORE=file`). Remove the test rows afterwards.
- Real `apt install` / `apt upgrade` cannot be tested here. Say so in your report and ask the owner to try it on
  one server (`apt-cache policy rackatlas-agent` must show the candidate from `rackatlas.dev`).

## Installer (`public/agent/install.sh`)

It must stay `bash`-compatible with `set -euo pipefail`, refuse non-https URLs, validate the token format
(`^ra_[A-Za-z0-9]{40}$`), require root, apt and systemd, and add the repository with
`signed-by=/etc/apt/keyrings/rackatlas.gpg`. Never add `--allow-unauthenticated` or disable signature checks.
The install command is built in `ServerAgentController` and shown in `agent.tsx`; if you change the installer
arguments, change both.

## Checklist before you finish

- [ ] Script is POSIX `sh`, secrets are not printed, runtime stays well below 45 s.
- [ ] Report format change is backward compatible and handled in `MetricsParser`/`LogParser`/`AgentIngestor`.
- [ ] `agent/VERSION` is raised, `DEBIAN` scripts are idempotent.
- [ ] Package and repository tested in a temporary directory, nothing left in `public/apt`.
- [ ] UI text and `lang/sk.json` / `lang/cs.json` updated if the install page or the data shown changed.
- [ ] The owner knows they must run `agent/publish-apt.sh KEYID`, commit and deploy.
