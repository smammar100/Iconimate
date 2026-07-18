#!/usr/bin/env bash
set -euo pipefail

AGENT_NAME="${1:-atom-eve-agent}"

if ! command -v gh >/dev/null 2>&1; then
  GH_VERSION="2.62.0"
  TARBALL="gh_${GH_VERSION}_linux_amd64.tar.gz"
  URL="https://github.com/cli/cli/releases/download/v${GH_VERSION}/${TARBALL}"

  mkdir -p "$HOME/.local"
  curl -fsSL "$URL" -o "/tmp/${TARBALL}"
  tar -xzf "/tmp/${TARBALL}" -C "$HOME/.local" --strip-components=1
  rm -f "/tmp/${TARBALL}"

  export PATH="$HOME/.local/bin:$PATH"
  if ! grep -qs '.local/bin' "$HOME/.profile" 2>/dev/null; then
    printf '\nexport PATH="$HOME/.local/bin:$PATH"\n' >> "$HOME/.profile"
  fi
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "gh installed but not found on PATH; expected $HOME/.local/bin/gh" >&2
  exit 1
fi

git config --global user.name "$AGENT_NAME"
git config --global user.email "${AGENT_NAME}@users.noreply.github.com"

if gh auth status >/dev/null 2>&1; then
  gh auth setup-git >/dev/null 2>&1 || true
fi
