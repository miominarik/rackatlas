#!/usr/bin/env bash
#
# Incremental SFTP deploy of the current directory.
#
# It compares SHA-1 checksums of the files with a manifest stored on the server
# (.deploy-manifest), uploads only new or changed files, deletes only files that
# were deployed before and no longer exist, and saves the new manifest last. When
# an upload fails, the manifest is not saved, so the next run retries everything
# that is still missing.
#
# Environment: SFTP_HOST, SFTP_USERNAME, LFTP_PASSWORD (read by lftp),
#   SFTP_PORT (22), SFTP_DIR (.), FULL_UPLOAD (false: ignore the server manifest),
#   DRY_RUN (1: only prepare the scripts, do not connect), OLD_MANIFEST (dry run only).

set -euo pipefail
export LC_ALL=C

SFTP_PORT="${SFTP_PORT:-22}"
SFTP_DIR="${SFTP_DIR:-.}"
MANIFEST=".deploy-manifest"
CHUNK_SIZE=150
PARALLEL=5

WORK="$(mktemp -d)"
trap '[ -n "${KEEP_WORK:-}" ] || rm -rf "$WORK"' EXIT

if command -v sha1sum >/dev/null 2>&1; then
  SHA1=(sha1sum)
else
  SHA1=(shasum -a 1)
fi

# Connection settings shared by every lftp script.
{
  echo 'set cmd:fail-exit yes'
  echo 'set sftp:auto-confirm yes'
  echo 'set net:max-retries 5'
  echo 'set net:timeout 30'
  echo 'set net:reconnect-interval-base 5'
  echo "open --env-password -u \"${SFTP_USERNAME:-}\" -p \"$SFTP_PORT\" \"sftp://${SFTP_HOST:-}\""
  if [ "$SFTP_DIR" != "." ]; then
    echo "cd \"$SFTP_DIR\""
  fi
} > "$WORK/connect.lftp"

# 1. What we are about to deploy: "<sha1>  <path>" per file.
find . -type f ! -name "$MANIFEST" -print0 | sort -z | xargs -0 "${SHA1[@]}" | sed 's#  \./#  #' > "$WORK/new"

# 2. What was deployed last time.
: > "$WORK/old"
if [ -n "${DRY_RUN:-}" ]; then
  [ -n "${OLD_MANIFEST:-}" ] && cp "$OLD_MANIFEST" "$WORK/old"
elif [ "${FULL_UPLOAD:-false}" != "true" ]; then
  { cat "$WORK/connect.lftp"; echo "get \"$MANIFEST\" -o \"$WORK/old\""; } > "$WORK/download.lftp"
  lftp -f "$WORK/download.lftp" || { echo "No manifest on the server, uploading everything."; : > "$WORK/old"; }
fi

# 3. New or changed files, and files that disappeared since the last deploy.
comm -13 <(sort "$WORK/old") <(sort "$WORK/new") | cut -c43- > "$WORK/changed"
comm -23 <(cut -c43- "$WORK/old" | sort) <(cut -c43- "$WORK/new" | sort) > "$WORK/removed"

TOTAL="$(wc -l < "$WORK/new" | tr -d ' ')"
CHANGED="$(wc -l < "$WORK/changed" | tr -d ' ')"
REMOVED="$(wc -l < "$WORK/removed" | tr -d ' ')"
echo "Files: $TOTAL, to upload: $CHANGED, to delete: $REMOVED"

if [ "$CHANGED" -eq 0 ] && [ "$REMOVED" -eq 0 ]; then
  echo "Nothing to deploy."
  exit 0
fi

# 4. Upload in chunks, several connections at once. A failed put aborts its chunk.
mkdir "$WORK/chunks"
split -l "$CHUNK_SIZE" "$WORK/changed" "$WORK/chunks/files."

for list in "$WORK"/chunks/files.*; do
  [ -e "$list" ] || continue
  {
    cat "$WORK/connect.lftp"
    sed -n 's#/[^/]*$##p' "$list" | sort -u | while IFS= read -r dir; do
      printf 'mkdir -p -f "%s"\n' "$dir"
    done
    while IFS= read -r file; do
      dir="$(dirname "$file")"
      printf 'put -O "%s" "%s"\n' "$dir" "$PWD/$file"
    done < "$list"
    echo 'echo chunk uploaded'
  } > "$list.lftp"
done

# 5. Delete the removed files and save the new manifest, only after every upload succeeded.
{
  cat "$WORK/connect.lftp"
  while IFS= read -r file; do
    printf 'rm -f "%s"\n' "$file"
  done < "$WORK/removed"
  printf 'put "%s" -o "%s"\n' "$WORK/new" "$MANIFEST"
  echo 'echo manifest saved'
} > "$WORK/finish.lftp"

if [ -n "${DRY_RUN:-}" ]; then
  echo "Dry run, scripts are in $WORK"
  KEEP_WORK=1
  exit 0
fi

if ls "$WORK"/chunks/files.*.lftp >/dev/null 2>&1; then
  printf '%s\0' "$WORK"/chunks/files.*.lftp | xargs -0 -n1 -P "$PARALLEL" lftp -f
fi

lftp -f "$WORK/finish.lftp"
echo "Deploy finished."
