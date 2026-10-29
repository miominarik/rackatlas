#!/usr/bin/env python3
"""
Builds the apt repository of the RackAtlas agent as plain files, signed with GPG.

    agent/apt-repo.py --deb rackatlas-agent.deb --repo public/apt --key KEYID
    agent/apt-repo.py --deb rackatlas-agent.deb --repo public/apt --no-sign

The repository is static: copy it to the web root and apt can use it. Every version that
was ever published stays in pool/, so an older one can be installed again
(apt install rackatlas-agent=1.1.0). A published version is never changed.

Only the standard library and gpg are needed, so it runs on macOS and Linux.
"""

import argparse
import datetime
import gzip
import hashlib
import io
import lzma
import os
import re
import shutil
import subprocess
import sys
import tarfile

SUITE = "stable"
COMPONENT = "main"
# The package is architecture independent (a shell script), so every architecture lists it.
ARCHITECTURES = ["amd64", "arm64", "armhf", "i386"]
POOL = "pool/main/r/rackatlas-agent"


def fail(message):
    sys.exit(f"Error: {message}")


def check_tar(label, name, body):
    """
    dpkg is stricter than Python: it refuses tar archives with PAX extended headers (typeflag x or g),
    which bsdtar on macOS adds for extended attributes, and files that are not owned by root.
    """
    try:
        raw = gzip.decompress(body) if name.endswith(".gz") else lzma.decompress(body) if name.endswith(".xz") else None
    except (OSError, lzma.LZMAError, EOFError) as error:
        fail(f"{label}: {name} cannot be decompressed ({error})")

    if raw is None:
        fail(f"{label}: {name} must be compressed with gzip or xz")

    offset = 0

    while offset + 512 <= len(raw):
        header = raw[offset : offset + 512]

        if header == b"\0" * 512:
            break

        entry = header[:100].split(b"\0")[0].decode(errors="replace")
        flag = header[156:157]
        size = int(header[124:136].strip(b"\0 ") or b"0", 8)

        if flag in (b"x", b"g"):
            fail(
                f"{label}: {name} contains PAX extended headers (entry {entry!r}). dpkg cannot unpack it. "
                "Build the package with agent/build-deb.sh, which writes a plain ustar archive."
            )

        if int(header[108:116].strip(b"\0 ") or b"0", 8) != 0 or int(header[116:124].strip(b"\0 ") or b"0", 8) != 0:
            fail(f"{label}: {entry!r} in {name} is not owned by root (uid/gid 0)")

        offset += 512 + ((size + 511) // 512) * 512


def read_deb(path):
    """Returns (control file text, installed size in KiB) of a .deb."""
    with open(path, "rb") as handle:
        data = handle.read()

    if data[:8] != b"!<arch>\n":
        fail(f"{path} is not a .deb (ar archive expected)")

    members = {}
    offset = 8

    while offset + 60 <= len(data):
        header = data[offset : offset + 60]
        name = header[:16].decode().strip().rstrip("/")
        size = int(header[48:58].decode().strip())
        members[name] = data[offset + 60 : offset + 60 + size]
        offset += 60 + size + (size % 2)

    control_name = next((n for n in members if n.startswith("control.tar")), None)
    data_name = next((n for n in members if n.startswith("data.tar")), None)

    if control_name is None or data_name is None:
        fail(f"{path} has no control.tar or data.tar")

    check_tar(path, control_name, members[control_name])
    check_tar(path, data_name, members[data_name])

    try:
        with tarfile.open(fileobj=io.BytesIO(members[control_name]), mode="r:*") as tar:
            member = next(m for m in tar.getmembers() if m.name in ("control", "./control"))
            control = tar.extractfile(member).read().decode()

        with tarfile.open(fileobj=io.BytesIO(members[data_name]), mode="r:*") as tar:
            total = sum(m.size for m in tar.getmembers() if m.isfile())
    except tarfile.ReadError as error:
        fail(f"{path} uses a compression this script cannot read ({error}); build it with gzip or xz")

    return control.strip("\n"), -(-total // 1024)


def field(control, name):
    match = re.search(rf"^{name}: (.+)$", control, re.MULTILINE)

    return match.group(1).strip() if match else None


def version_key(version):
    """Good enough to compare the plain numeric versions of this package (1.2.10 > 1.2.9)."""
    return [int(part) if part.isdigit() else part for part in re.split(r"[.\-~+]", version)]


def digests(path):
    md5, sha1, sha256 = hashlib.md5(), hashlib.sha1(), hashlib.sha256()

    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            md5.update(chunk)
            sha1.update(chunk)
            sha256.update(chunk)

    return md5.hexdigest(), sha1.hexdigest(), sha256.hexdigest()


def add_to_pool(deb, repo, replace, allow_older):
    control, _ = read_deb(deb)
    package, version, architecture = (field(control, n) for n in ("Package", "Version", "Architecture"))

    if package != "rackatlas-agent" or not version or architecture != "all":
        fail("the package must be rackatlas-agent with Architecture: all")

    pool = os.path.join(repo, POOL)
    os.makedirs(pool, exist_ok=True)
    target = os.path.join(pool, f"{package}_{version}_all.deb")

    if os.path.exists(target):
        if digests(target)[2] != digests(deb)[2] and not replace:
            fail(
                f"version {version} is already published with different content. apt clients remember "
                "the checksum of a version, so raise the version in agent/VERSION instead "
                "(--replace overrides this, only for a version nobody installed)."
            )
    else:
        existing = [
            field(read_deb(os.path.join(pool, f))[0], "Version")
            for f in os.listdir(pool)
            if f.endswith(".deb")
        ]

        if existing and not allow_older and version_key(version) <= max(version_key(v) for v in existing):
            fail(f"version {version} is not newer than the published {max(existing, key=version_key)}")

        shutil.copyfile(deb, target)

    return version


def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)

    with open(path, "wb") as handle:
        handle.write(content if isinstance(content, bytes) else content.encode())


def build_indexes(repo):
    """Writes Packages for every architecture and returns the list of files for Release."""
    pool = os.path.join(repo, POOL)
    stanzas = []

    for name in sorted(os.listdir(pool)):
        if not name.endswith(".deb"):
            continue

        path = os.path.join(pool, name)
        control, installed_size = read_deb(path)
        md5, sha1, sha256 = digests(path)

        stanzas.append(
            (
                version_key(field(control, "Version")),
                f"{control}\nInstalled-Size: {installed_size}\nFilename: {POOL}/{name}\n"
                f"Size: {os.path.getsize(path)}\nMD5sum: {md5}\nSHA1: {sha1}\nSHA256: {sha256}\n",
            )
        )

    packages = "\n".join(text for _, text in sorted(stanzas, key=lambda s: s[0], reverse=True))
    files = []

    for architecture in ARCHITECTURES:
        directory = os.path.join(repo, "dists", SUITE, COMPONENT, f"binary-{architecture}")
        write(os.path.join(directory, "Packages"), packages)

        buffer = io.BytesIO()
        with gzip.GzipFile(fileobj=buffer, mode="wb", mtime=0) as archive:
            archive.write(packages.encode())
        write(os.path.join(directory, "Packages.gz"), buffer.getvalue())

        files += [
            f"{COMPONENT}/binary-{architecture}/Packages",
            f"{COMPONENT}/binary-{architecture}/Packages.gz",
        ]

    return files


def build_release(repo, files):
    base = os.path.join(repo, "dists", SUITE)
    now = datetime.datetime.now(datetime.timezone.utc)
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    date = f"{days[now.weekday()]}, {now.day:02d} {months[now.month - 1]} {now.year} {now:%H:%M:%S} UTC"

    lines = [
        "Origin: RackAtlas",
        "Label: RackAtlas",
        f"Suite: {SUITE}",
        f"Codename: {SUITE}",
        f"Date: {date}",
        f"Architectures: {' '.join(ARCHITECTURES)}",
        f"Components: {COMPONENT}",
        "Description: RackAtlas monitoring agent",
    ]

    for label, index in (("MD5Sum", 0), ("SHA1", 1), ("SHA256", 2)):
        lines.append(f"{label}:")

        for relative in files:
            path = os.path.join(base, relative)
            lines.append(f" {digests(path)[index]} {os.path.getsize(path):>16} {relative}")

    write(os.path.join(base, "Release"), "\n".join(lines) + "\n")

    return os.path.join(base, "Release")


def gpg(*arguments):
    command = [os.environ.get("GPG", "gpg"), *arguments]

    try:
        return subprocess.run(command, check=True, capture_output=True).stdout
    except FileNotFoundError:
        fail("gpg is not installed (macOS: brew install gnupg)")
    except subprocess.CalledProcessError as error:
        fail(f"gpg failed: {error.stderr.decode().strip()}")


def sign(repo, release, key):
    base = os.path.dirname(release)

    gpg("--batch", "--yes", "--local-user", key, "--digest-algo", "SHA256", "--clearsign",
        "--output", os.path.join(base, "InRelease"), release)
    gpg("--batch", "--yes", "--local-user", key, "--digest-algo", "SHA256", "--armor", "--detach-sign",
        "--output", os.path.join(base, "Release.gpg"), release)

    write(os.path.join(repo, "rackatlas.gpg"), gpg("--export", key))
    write(os.path.join(repo, "rackatlas.asc"), gpg("--armor", "--export", key))


def verify(repo, signed):
    """Checks the finished repository the way apt would: hashes of every file, then the signature."""
    base = os.path.join(repo, "dists", SUITE)
    release = open(os.path.join(base, "Release")).read()

    for match in re.finditer(r"^ ([0-9a-f]{64}) +(\d+) (\S+)$", release, re.MULTILINE):
        checksum, size, relative = match.groups()
        path = os.path.join(base, relative)

        if not os.path.exists(path) or os.path.getsize(path) != int(size) or digests(path)[2] != checksum:
            fail(f"{relative} does not match the Release file")

    packages = open(os.path.join(base, COMPONENT, "binary-amd64", "Packages")).read()

    for filename, checksum in re.findall(r"^Filename: (\S+)\n(?:.*\n)*?SHA256: ([0-9a-f]{64})$", packages, re.MULTILINE):
        path = os.path.join(repo, filename)

        if not os.path.exists(path) or digests(path)[2] != checksum:
            fail(f"{filename} does not match the Packages file")

    if signed:
        keyring = os.path.join(repo, "rackatlas.gpg")
        gpg("--no-default-keyring", "--keyring", keyring, "--verify", os.path.join(base, "InRelease"))
        gpg("--no-default-keyring", "--keyring", keyring, "--verify",
            os.path.join(base, "Release.gpg"), os.path.join(base, "Release"))


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--deb", required=True)
    parser.add_argument("--repo", required=True)
    parser.add_argument("--key", help="id or fingerprint of the GPG key that signs the repository")
    parser.add_argument("--no-sign", action="store_true", help="write the repository unsigned (tests only)")
    parser.add_argument("--replace", action="store_true", help="overwrite a published version with other content")
    parser.add_argument("--allow-older", action="store_true", help="publish a version lower than the newest one")
    args = parser.parse_args()

    if not args.key and not args.no_sign:
        fail("give --key KEYID (or --no-sign for a test)")

    version = add_to_pool(args.deb, args.repo, args.replace, args.allow_older)
    release = build_release(args.repo, build_indexes(args.repo))

    if not args.no_sign:
        sign(args.repo, release, args.key)

    verify(args.repo, signed=not args.no_sign)
    print(f"Published rackatlas-agent {version} in {args.repo} ({'signed' if not args.no_sign else 'UNSIGNED'})")


if __name__ == "__main__":
    main()
